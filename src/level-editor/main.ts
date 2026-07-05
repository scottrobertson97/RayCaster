import { KEY_GREEN } from '../config/constants.js'
import { defaultLevel } from '../data/default-level.js'
import { TILE_IDS } from '../data/tile-definitions.js'
import { tileCenter, worldToTile } from '../math/tile-coordinates.js'
import type { LevelEntityDefinition } from '../types.js'
import './styles.css'

type TileToolId =
  | 'empty'
  | 'stoneWall'
  | 'metalWall'
  | 'unlockedDoor'
  | 'lockedRedDoor'
  | 'lockedGreenDoor'

type EntityKind =
  | 'enemyGuard'
  | 'enemyPatrol'
  | 'decoration'
  | 'redKeycard'
  | 'greenKeycard'

type PlacementToolId = 'player' | EntityKind
type ToolId = 'select' | 'erase' | TileToolId | PlacementToolId

type TileTool = {
  id: TileToolId
  label: string
  tileId: number
  className: string
}

type EntityTool = {
  id: PlacementToolId
  label: string
  marker: string
  className: string
  defaultSize: number
}

type EditorEntity = {
  id: string
  kind: EntityKind
  x: number
  y: number
  size: number
}

type EditorState = {
  map: number[][]
  playerStart: {
    x: number
    y: number
    a: number
  }
  entities: EditorEntity[]
  activeTool: ToolId
  selectedTile: { x: number; y: number } | null
  selectedEntityId: string | null
  isPainting: boolean
  dirty: boolean
  saving: boolean
  status: string
}

type SaveResponse = {
  ok: boolean
  error?: string
}

const tileTools = [
  { id: 'empty', label: 'Empty', tileId: TILE_IDS.empty, className: 'tile-empty' },
  { id: 'stoneWall', label: 'Stone', tileId: TILE_IDS.stoneWall, className: 'tile-stone' },
  { id: 'metalWall', label: 'Metal', tileId: TILE_IDS.metalWall, className: 'tile-metal' },
  { id: 'unlockedDoor', label: 'Door', tileId: TILE_IDS.unlockedDoor, className: 'tile-door' },
  { id: 'lockedRedDoor', label: 'Red Door', tileId: TILE_IDS.lockedRedDoor, className: 'tile-red-door' },
  { id: 'lockedGreenDoor', label: 'Green Door', tileId: TILE_IDS.lockedGreenDoor, className: 'tile-green-door' },
] as const satisfies readonly TileTool[]

const entityTools = [
  { id: 'player', label: 'Player', marker: 'P', className: 'marker-player', defaultSize: 20 },
  { id: 'enemyGuard', label: 'Guard', marker: 'G', className: 'marker-enemy', defaultSize: 10 },
  { id: 'enemyPatrol', label: 'Patrol', marker: 'E', className: 'marker-enemy-alt', defaultSize: 10 },
  { id: 'decoration', label: 'Decor', marker: 'D', className: 'marker-decor', defaultSize: 40 },
  { id: 'redKeycard', label: 'Red Key', marker: 'R', className: 'marker-red-key', defaultSize: 10 },
  { id: 'greenKeycard', label: 'Green Key', marker: 'K', className: 'marker-green-key', defaultSize: 10 },
] as const satisfies readonly EntityTool[]

const tileToolById = new Map<TileToolId, TileTool>(tileTools.map((tool) => [tool.id, tool]))
const entityToolById = new Map<PlacementToolId, EntityTool>(entityTools.map((tool) => [tool.id, tool]))
const entityKinds: EntityKind[] = [
  'enemyGuard',
  'enemyPatrol',
  'decoration',
  'redKeycard',
  'greenKeycard',
]

let nextEntityId = 1
const defaultPlayerStart = defaultLevel.playerStart as { x?: number; y?: number; a?: number } | undefined

const state: EditorState = {
  map: defaultLevel.map.map((row) => [...row]),
  playerStart: {
    x: defaultPlayerStart?.x ?? tileCenter(1),
    y: defaultPlayerStart?.y ?? tileCenter(1),
    a: defaultPlayerStart?.a ?? 0,
  },
  entities: (defaultLevel.entities ?? []).map(toEditorEntity),
  activeTool: 'select',
  selectedTile: null,
  selectedEntityId: null,
  isPainting: false,
  dirty: false,
  saving: false,
  status: 'Ready',
}

document.title = 'RayCaster Level Editor'
document.body.innerHTML = `
  <main class="editor-shell">
    <header class="topbar">
      <div>
        <p class="eyebrow">Developer Mode</p>
        <h1>Level Editor</h1>
      </div>
      <div class="topbar-actions">
        <a class="ghost-button" href="/">Play</a>
        <button class="ghost-button" id="reload-level" type="button">Reload</button>
        <button class="primary-button" id="save-level" type="button">Save Source</button>
      </div>
    </header>

    <aside class="palette-panel">
      <section class="tool-section">
        <h2>Actions</h2>
        <div class="tool-grid" id="action-tools"></div>
      </section>
      <section class="tool-section">
        <h2>Blocks</h2>
        <div class="tool-grid" id="tile-tools"></div>
      </section>
      <section class="tool-section">
        <h2>Entities</h2>
        <div class="tool-grid" id="entity-tools"></div>
      </section>
    </aside>

    <section class="map-panel">
      <div class="map-toolbar">
        <label>
          Width
          <input id="map-width" type="number" min="3" max="64" step="1" />
        </label>
        <label>
          Height
          <input id="map-height" type="number" min="3" max="64" step="1" />
        </label>
        <button class="ghost-button" id="resize-map" type="button">Resize</button>
        <button class="ghost-button" id="frame-walls" type="button">Frame Walls</button>
        <button class="ghost-button" id="clear-entities" type="button">Clear Entities</button>
      </div>
      <div class="grid-scroll">
        <div class="level-grid" id="level-grid"></div>
      </div>
    </section>

    <aside class="inspector-panel">
      <section class="tool-section">
        <h2>Selection</h2>
        <div id="selection-panel"></div>
      </section>
      <section class="tool-section">
        <h2>Player</h2>
        <div id="player-panel"></div>
      </section>
      <section class="tool-section">
        <h2>Entities</h2>
        <div id="entity-list"></div>
      </section>
      <p class="status-line" id="status-line" role="status"></p>
    </aside>
  </main>
`

const grid = requiredElement<HTMLDivElement>('level-grid')
const actionToolsRoot = requiredElement<HTMLDivElement>('action-tools')
const tileToolsRoot = requiredElement<HTMLDivElement>('tile-tools')
const entityToolsRoot = requiredElement<HTMLDivElement>('entity-tools')
const selectionPanel = requiredElement<HTMLDivElement>('selection-panel')
const playerPanel = requiredElement<HTMLDivElement>('player-panel')
const entityList = requiredElement<HTMLDivElement>('entity-list')
const statusLine = requiredElement<HTMLParagraphElement>('status-line')
const saveButton = requiredElement<HTMLButtonElement>('save-level')
const reloadButton = requiredElement<HTMLButtonElement>('reload-level')
const resizeButton = requiredElement<HTMLButtonElement>('resize-map')
const frameWallsButton = requiredElement<HTMLButtonElement>('frame-walls')
const clearEntitiesButton = requiredElement<HTMLButtonElement>('clear-entities')
const mapWidthInput = requiredElement<HTMLInputElement>('map-width')
const mapHeightInput = requiredElement<HTMLInputElement>('map-height')

render()

window.addEventListener('pointerup', stopPainting)
window.addEventListener('pointercancel', stopPainting)
window.addEventListener('blur', stopPainting)

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopPainting()
  }
})

window.addEventListener('beforeunload', (event) => {
  if (!state.dirty) return
  event.preventDefault()
  event.returnValue = ''
})

saveButton.addEventListener('click', () => {
  void saveLevel()
})

reloadButton.addEventListener('click', () => {
  window.location.reload()
})

resizeButton.addEventListener('click', () => {
  resizeMap(Number(mapWidthInput.value), Number(mapHeightInput.value))
})

frameWallsButton.addEventListener('click', () => {
  frameWalls()
})

clearEntitiesButton.addEventListener('click', () => {
  if (state.entities.length === 0) return
  state.entities = []
  state.selectedEntityId = null
  markDirty('Entities cleared')
})

function render() {
  renderPalette()
  renderGrid()
  renderInspector()
  renderStatus()
}

function renderPalette() {
  actionToolsRoot.replaceChildren(
    createToolButton('select', 'Select', 'tool-select'),
    createToolButton('erase', 'Erase', 'tool-erase'),
  )
  tileToolsRoot.replaceChildren(
    ...tileTools.map((tool) => createToolButton(tool.id, tool.label, tool.className)),
  )
  entityToolsRoot.replaceChildren(
    ...entityTools.map((tool) => createToolButton(tool.id, tool.label, tool.className, tool.marker)),
  )
}

function createToolButton(toolId: ToolId, label: string, className: string, marker = '') {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = `tool-button ${state.activeTool === toolId ? 'is-active' : ''}`
  button.dataset.tool = toolId

  const swatch = document.createElement('span')
  swatch.className = `tool-swatch ${className}`
  swatch.textContent = marker

  const text = document.createElement('span')
  text.textContent = label

  button.append(swatch, text)
  button.addEventListener('click', () => {
    state.activeTool = toolId
    render()
  })

  return button
}

function renderGrid() {
  mapWidthInput.value = String(mapWidth())
  mapHeightInput.value = String(mapHeight())
  grid.style.setProperty('--map-width', String(mapWidth()))
  grid.replaceChildren()

  const playerTile = getPlayerTile()

  for (let y = 0; y < mapHeight(); y += 1) {
    for (let x = 0; x < mapWidth(); x += 1) {
      const tileId = state.map[y][x]
      const cell = document.createElement('button')
      cell.type = 'button'
      cell.className = `tile-cell ${tileClassName(tileId)}`
      cell.dataset.x = String(x)
      cell.dataset.y = String(y)
      cell.setAttribute('aria-label', `Tile ${x}, ${y}`)

      if (state.selectedTile?.x === x && state.selectedTile.y === y) {
        cell.classList.add('is-selected')
      }

      const markerLayer = document.createElement('span')
      markerLayer.className = 'cell-markers'

      if (playerTile.x === x && playerTile.y === y) {
        markerLayer.append(createMarker(entityToolById.get('player')!, false))
      }

      for (const entity of entitiesAtTile(x, y)) {
        markerLayer.append(createMarker(entityToolById.get(entity.kind)!, entity.id === state.selectedEntityId))
      }

      cell.append(markerLayer)
      cell.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return
        event.preventDefault()
        state.isPainting = isTileTool(state.activeTool)
        applyToolAt(x, y)
      })
      cell.addEventListener('pointerenter', (event) => {
        if (!state.isPainting || !isTileTool(state.activeTool)) return

        if (event.buttons !== 1) {
          stopPainting()
          return
        }

        applyToolAt(x, y)
      })

      grid.append(cell)
    }
  }
}

function stopPainting() {
  state.isPainting = false
}

function createMarker(tool: EntityTool, selected: boolean) {
  const marker = document.createElement('span')
  marker.className = `cell-marker ${tool.className} ${selected ? 'is-selected-marker' : ''}`
  marker.textContent = tool.marker
  marker.title = tool.label
  return marker
}

function renderInspector() {
  const selectedEntity = state.entities.find((entity) => entity.id === state.selectedEntityId) ?? null
  renderSelectionPanel(selectedEntity)
  renderPlayerPanel()
  renderEntityList()
}

function renderSelectionPanel(selectedEntity: EditorEntity | null) {
  selectionPanel.replaceChildren()

  if (selectedEntity) {
    const title = document.createElement('h3')
    title.textContent = entityToolById.get(selectedEntity.kind)?.label ?? 'Entity'

    const kindSelect = document.createElement('select')
    for (const kind of entityKinds) {
      const option = document.createElement('option')
      option.value = kind
      option.textContent = entityToolById.get(kind)?.label ?? kind
      option.selected = kind === selectedEntity.kind
      kindSelect.append(option)
    }
    kindSelect.addEventListener('change', () => {
      selectedEntity.kind = kindSelect.value as EntityKind
      selectedEntity.size = entityToolById.get(selectedEntity.kind)?.defaultSize ?? selectedEntity.size
      markDirty('Entity type changed')
    })

    const tile = worldEntityToTile(selectedEntity)
    const tileXInput = numberInput(tile.x, 0, mapWidth() - 1)
    const tileYInput = numberInput(tile.y, 0, mapHeight() - 1)
    const sizeInput = numberInput(selectedEntity.size, 1, 128)

    tileXInput.addEventListener('change', () => {
      selectedEntity.x = tileCenter(clampTile(Number(tileXInput.value), mapWidth()))
      markDirty('Entity moved')
    })
    tileYInput.addEventListener('change', () => {
      selectedEntity.y = tileCenter(clampTile(Number(tileYInput.value), mapHeight()))
      markDirty('Entity moved')
    })
    sizeInput.addEventListener('change', () => {
      selectedEntity.size = clampNumber(Number(sizeInput.value), 1, 128)
      markDirty('Entity size changed')
    })

    const deleteButton = document.createElement('button')
    deleteButton.type = 'button'
    deleteButton.className = 'danger-button'
    deleteButton.textContent = 'Delete Entity'
    deleteButton.addEventListener('click', () => {
      state.entities = state.entities.filter((entity) => entity.id !== selectedEntity.id)
      state.selectedEntityId = null
      markDirty('Entity deleted')
    })

    selectionPanel.append(
      title,
      fieldRow('Type', kindSelect),
      fieldRow('Tile X', tileXInput),
      fieldRow('Tile Y', tileYInput),
      fieldRow('Size', sizeInput),
      deleteButton,
    )
    return
  }

  if (state.selectedTile) {
    const tileId = state.map[state.selectedTile.y][state.selectedTile.x]
    const tileSelect = document.createElement('select')
    for (const tool of tileTools) {
      const option = document.createElement('option')
      option.value = String(tool.tileId)
      option.textContent = tool.label
      option.selected = tool.tileId === tileId
      tileSelect.append(option)
    }
    tileSelect.addEventListener('change', () => {
      state.map[state.selectedTile!.y][state.selectedTile!.x] = Number(tileSelect.value)
      markDirty('Tile changed')
    })

    const tileTitle = document.createElement('h3')
    tileTitle.textContent = `Tile ${state.selectedTile.x}, ${state.selectedTile.y}`
    selectionPanel.append(tileTitle, fieldRow('Block', tileSelect))
    return
  }

  const empty = document.createElement('p')
  empty.className = 'muted-text'
  empty.textContent = 'Nothing selected'
  selectionPanel.append(empty)
}

function renderPlayerPanel() {
  playerPanel.replaceChildren()
  const playerTile = getPlayerTile()
  const playerTileX = numberInput(playerTile.x, 0, mapWidth() - 1)
  const playerTileY = numberInput(playerTile.y, 0, mapHeight() - 1)
  const angleInput = numberInput(radiansToDegrees(state.playerStart.a), 0, 359)

  playerTileX.addEventListener('change', () => {
    state.playerStart.x = tileCenter(clampTile(Number(playerTileX.value), mapWidth()))
    markDirty('Player moved')
  })
  playerTileY.addEventListener('change', () => {
    state.playerStart.y = tileCenter(clampTile(Number(playerTileY.value), mapHeight()))
    markDirty('Player moved')
  })
  angleInput.addEventListener('change', () => {
    state.playerStart.a = degreesToRadians(clampNumber(Number(angleInput.value), 0, 359))
    markDirty('Player angle changed')
  })

  playerPanel.append(
    fieldRow('Tile X', playerTileX),
    fieldRow('Tile Y', playerTileY),
    fieldRow('Angle', angleInput),
  )
}

function renderEntityList() {
  entityList.replaceChildren()
  const summary = document.createElement('p')
  summary.className = 'summary-line'
  summary.textContent = `${mapWidth()} x ${mapHeight()} tiles, ${state.entities.length} entities`
  entityList.append(summary)

  for (const entity of state.entities) {
    const tile = worldEntityToTile(entity)
    const button = document.createElement('button')
    button.type = 'button'
    button.className = `entity-list-item ${entity.id === state.selectedEntityId ? 'is-active' : ''}`
    button.textContent = `${entityToolById.get(entity.kind)?.label ?? entity.kind} at ${tile.x}, ${tile.y}`
    button.addEventListener('click', () => {
      state.selectedEntityId = entity.id
      state.selectedTile = tile
      render()
    })
    entityList.append(button)
  }
}

function renderStatus() {
  saveButton.disabled = state.saving
  saveButton.textContent = state.saving ? 'Saving...' : state.dirty ? 'Save Source *' : 'Save Source'
  statusLine.textContent = state.status
}

function applyToolAt(tileX: number, tileY: number) {
  state.selectedTile = { x: tileX, y: tileY }

  if (state.activeTool === 'select') {
    const entity = lastEntityAtTile(tileX, tileY)
    state.selectedEntityId = entity?.id ?? null
    render()
    return
  }

  if (state.activeTool === 'erase') {
    const entity = lastEntityAtTile(tileX, tileY)
    if (entity) {
      state.entities = state.entities.filter((candidate) => candidate.id !== entity.id)
      state.selectedEntityId = null
      markDirty('Entity erased')
    } else if (state.map[tileY][tileX] !== TILE_IDS.empty) {
      state.map[tileY][tileX] = TILE_IDS.empty
      markDirty('Tile erased')
    } else {
      render()
    }
    return
  }

  if (isTileTool(state.activeTool)) {
    const tool = tileToolById.get(state.activeTool)!
    if (state.map[tileY][tileX] !== tool.tileId) {
      state.map[tileY][tileX] = tool.tileId
      state.selectedEntityId = null
      markDirty('Tile painted')
    } else {
      render()
    }
    return
  }

  if (state.activeTool === 'player') {
    state.playerStart.x = tileCenter(tileX)
    state.playerStart.y = tileCenter(tileY)
    ensureFloor(tileX, tileY)
    state.selectedEntityId = null
    markDirty('Player placed')
    return
  }

  placeEntity(state.activeTool, tileX, tileY)
}

function placeEntity(kind: EntityKind, tileX: number, tileY: number) {
  const existing = lastEntityAtTile(tileX, tileY)
  const tool = entityToolById.get(kind)!
  ensureFloor(tileX, tileY)

  if (existing) {
    existing.kind = kind
    existing.size = tool.defaultSize
    existing.x = tileCenter(tileX)
    existing.y = tileCenter(tileY)
    state.selectedEntityId = existing.id
  } else {
    const entity = {
      id: createEntityId(),
      kind,
      x: tileCenter(tileX),
      y: tileCenter(tileY),
      size: tool.defaultSize,
    }
    state.entities.push(entity)
    state.selectedEntityId = entity.id
  }

  markDirty('Entity placed')
}

async function saveLevel() {
  if (state.saving) return

  state.saving = true
  state.status = 'Saving source files'
  renderStatus()

  try {
    const response = await fetch('/__level-editor/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        map: state.map,
        playerStart: state.playerStart,
        entities: state.entities,
      }),
    })
    const result = (await response.json()) as SaveResponse
    if (!response.ok || !result.ok) {
      throw new Error(result.error ?? 'Save failed')
    }
    state.dirty = false
    state.status = 'Saved to src/data'
  } catch (error) {
    state.status = error instanceof Error ? error.message : 'Save failed'
  } finally {
    state.saving = false
    render()
  }
}

function resizeMap(width: number, height: number) {
  const nextWidth = clampTile(width, 65)
  const nextHeight = clampTile(height, 65)
  if (nextWidth < 3 || nextHeight < 3) return

  const nextMap: number[][] = []
  for (let y = 0; y < nextHeight; y += 1) {
    const row: number[] = []
    for (let x = 0; x < nextWidth; x += 1) {
      row.push(state.map[y]?.[x] ?? defaultTileForPosition(x, y, nextWidth, nextHeight))
    }
    nextMap.push(row)
  }

  state.map = nextMap
  clampWorldObjectsToMap()
  markDirty('Map resized')
}

function frameWalls() {
  for (let y = 0; y < mapHeight(); y += 1) {
    for (let x = 0; x < mapWidth(); x += 1) {
      if (x === 0 || y === 0 || x === mapWidth() - 1 || y === mapHeight() - 1) {
        state.map[y][x] = TILE_IDS.stoneWall
      }
    }
  }
  markDirty('Walls framed')
}

function clampWorldObjectsToMap() {
  const clampedPlayer = clampWorldPointToMap(state.playerStart.x, state.playerStart.y)
  state.playerStart.x = clampedPlayer.x
  state.playerStart.y = clampedPlayer.y

  for (const entity of state.entities) {
    const clampedEntity = clampWorldPointToMap(entity.x, entity.y)
    entity.x = clampedEntity.x
    entity.y = clampedEntity.y
  }
}

function clampWorldPointToMap(x: number, y: number) {
  return {
    x: tileCenter(clampTile(worldToTile(x), mapWidth())),
    y: tileCenter(clampTile(worldToTile(y), mapHeight())),
  }
}

function ensureFloor(tileX: number, tileY: number) {
  if (state.map[tileY][tileX] !== TILE_IDS.empty) {
    state.map[tileY][tileX] = TILE_IDS.empty
  }
}

function markDirty(status: string) {
  state.dirty = true
  state.status = status
  render()
}

function toEditorEntity(entity: LevelEntityDefinition): EditorEntity {
  return {
    id: createEntityId(),
    kind: inferEntityKind(entity),
    x: entity.x,
    y: entity.y,
    size: entity.size,
  }
}

function inferEntityKind(entity: LevelEntityDefinition): EntityKind {
  if (entity.type === 'pickup') {
    return entity.pickupType === KEY_GREEN ? 'greenKeycard' : 'redKeycard'
  }
  if (entity.type === 'enemy') {
    return Array.isArray(entity.asset) ? 'enemyPatrol' : 'enemyGuard'
  }
  return 'decoration'
}

function isTileTool(tool: ToolId): tool is TileToolId {
  return tileToolById.has(tool as TileToolId)
}

function entitiesAtTile(tileX: number, tileY: number) {
  return state.entities.filter((entity) => {
    const tile = worldEntityToTile(entity)
    return tile.x === tileX && tile.y === tileY
  })
}

function lastEntityAtTile(tileX: number, tileY: number) {
  return entitiesAtTile(tileX, tileY).at(-1) ?? null
}

function worldEntityToTile(entity: EditorEntity) {
  return {
    x: worldToTile(entity.x),
    y: worldToTile(entity.y),
  }
}

function getPlayerTile() {
  return {
    x: worldToTile(state.playerStart.x),
    y: worldToTile(state.playerStart.y),
  }
}

function mapWidth() {
  return state.map[0]?.length ?? 0
}

function mapHeight() {
  return state.map.length
}

function tileClassName(tileId: number) {
  return tileTools.find((tool) => tool.tileId === tileId)?.className ?? 'tile-unknown'
}

function defaultTileForPosition(x: number, y: number, width: number, height: number) {
  return x === 0 || y === 0 || x === width - 1 || y === height - 1
    ? TILE_IDS.stoneWall
    : TILE_IDS.empty
}

function fieldRow(labelText: string, control: HTMLElement) {
  const label = document.createElement('label')
  label.className = 'field-row'
  const text = document.createElement('span')
  text.textContent = labelText
  label.append(text, control)
  return label
}

function numberInput(value: number, min: number, max: number) {
  const input = document.createElement('input')
  input.type = 'number'
  input.min = String(min)
  input.max = String(max)
  input.step = '1'
  input.value = String(Math.round(value))
  return input
}

function clampTile(value: number, upperBound: number) {
  return Math.max(0, Math.min(upperBound - 1, Math.trunc(Number.isFinite(value) ? value : 0)))
}

function clampNumber(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Number.isFinite(value) ? value : min))
}

function degreesToRadians(degrees: number) {
  return (degrees * Math.PI) / 180
}

function radiansToDegrees(radians: number) {
  const degrees = (radians * 180) / Math.PI
  return ((degrees % 360) + 360) % 360
}

function createEntityId() {
  const id = `entity-${nextEntityId}`
  nextEntityId += 1
  return id
}

function requiredElement<T extends HTMLElement>(id: string) {
  const element = document.getElementById(id)
  if (!element) {
    throw new Error(`Missing #${id}`)
  }
  return element as T
}
