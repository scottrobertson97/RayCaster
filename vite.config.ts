import { defineConfig, type Plugin } from 'vite'

type SaveEntityKind =
  | 'enemyGuard'
  | 'enemyPatrol'
  | 'decoration'
  | 'redKeycard'
  | 'greenKeycard'

type SaveLevelEntity = {
  id: string
  kind: SaveEntityKind
  x: number
  y: number
  size: number
}

type SaveLevelPayload = {
  map: number[][]
  playerStart: {
    x: number
    y: number
    a: number
  }
  entities: SaveLevelEntity[]
}

type NodeFsPromises = {
  writeFile(file: URL, data: string, encoding: 'utf8'): Promise<void>
}

type WritableResponse = {
  statusCode: number
  setHeader(name: string, value: string): void
  end(body?: string): void
}

type ReadableRequest = {
  method?: string
  url?: string
  setEncoding(encoding: 'utf8'): void
  on(event: 'data', listener: (chunk: string) => void): void
  on(event: 'end', listener: () => void): void
  on(event: 'error', listener: (error: Error) => void): void
}

const importNodeModule = new Function('specifier', 'return import(specifier)') as (
  specifier: string,
) => Promise<unknown>

const levelEditorHtml = String.raw`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>RayCaster Level Editor</title>
  </head>
  <body>
    <script type="module" src="/src/level-editor/main.ts"></script>
  </body>
</html>`

const allowedTileIds = new Set([0, 1, 2, 3, 4, 7])
const allowedEntityKinds = new Set<SaveEntityKind>([
  'enemyGuard',
  'enemyPatrol',
  'decoration',
  'redKeycard',
  'greenKeycard',
])

export default defineConfig({
  base: './',
  plugins: [levelEditorDevPlugin()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})

function levelEditorDevPlugin(): Plugin {
  return {
    name: 'raycaster-level-editor-dev-server',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const request = req as unknown as ReadableRequest
        const response = res as unknown as WritableResponse
        const url = request.url?.split('?')[0] ?? ''

        if (request.method === 'GET' && (url === '/level-editor' || url === '/level-editor/')) {
          response.statusCode = 200
          response.setHeader('Content-Type', 'text/html; charset=utf-8')
          response.setHeader('Cache-Control', 'no-store')
          response.end(levelEditorHtml)
          return
        }

        if (request.method === 'POST' && url === '/__level-editor/save') {
          try {
            const payload = normalizeLevelPayload(await readJsonBody(request))
            const fs = (await importNodeModule('node:fs/promises')) as NodeFsPromises
            await Promise.all([
              fs.writeFile(
                new URL('./src/data/map-matrix.ts', import.meta.url),
                formatMapMatrix(payload.map),
                'utf8',
              ),
              fs.writeFile(
                new URL('./src/data/default-level.ts', import.meta.url),
                formatDefaultLevel(payload),
                'utf8',
              ),
            ])
            sendJson(response, 200, { ok: true })
          } catch (error) {
            sendJson(response, 400, {
              ok: false,
              error: error instanceof Error ? error.message : 'Unable to save level',
            })
          }
          return
        }

        next()
      })
    },
  }
}

function readJsonBody(req: {
  setEncoding(encoding: 'utf8'): void
  on(event: 'data', listener: (chunk: string) => void): void
  on(event: 'end', listener: () => void): void
  on(event: 'error', listener: (error: Error) => void): void
}) {
  return new Promise<unknown>((resolve, reject) => {
    let body = ''
    req.setEncoding('utf8')
    req.on('data', (chunk) => {
      body += chunk
      if (body.length > 1_000_000) {
        reject(new Error('Level payload is too large'))
      }
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(body))
      } catch {
        reject(new Error('Level payload must be valid JSON'))
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res: WritableResponse, statusCode: number, payload: unknown) {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(payload))
}

function normalizeLevelPayload(payload: unknown): SaveLevelPayload {
  if (!isRecord(payload)) {
    throw new Error('Level payload must be an object')
  }

  return {
    map: normalizeMap(payload.map),
    playerStart: normalizePlayerStart(payload.playerStart),
    entities: normalizeEntities(payload.entities),
  }
}

function normalizeMap(map: unknown) {
  if (!Array.isArray(map) || map.length < 3 || map.length > 64) {
    throw new Error('Map height must be between 3 and 64 tiles')
  }

  const width = Array.isArray(map[0]) ? map[0].length : 0
  if (width < 3 || width > 64) {
    throw new Error('Map width must be between 3 and 64 tiles')
  }

  return map.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length !== width) {
      throw new Error(`Map row ${rowIndex + 1} must be ${width} tiles wide`)
    }

    return row.map((tile, columnIndex) => {
      if (!Number.isInteger(tile) || !allowedTileIds.has(tile)) {
        throw new Error(`Unsupported tile id at ${columnIndex + 1}, ${rowIndex + 1}`)
      }
      return tile
    })
  })
}

function normalizePlayerStart(playerStart: unknown) {
  if (!isRecord(playerStart)) {
    throw new Error('Player start is required')
  }

  return {
    x: finiteNumber(playerStart.x, 'Player x'),
    y: finiteNumber(playerStart.y, 'Player y'),
    a: finiteNumber(playerStart.a, 'Player angle'),
  }
}

function normalizeEntities(entities: unknown) {
  if (!Array.isArray(entities)) {
    throw new Error('Entities must be an array')
  }

  return entities.map((entity, index) => {
    if (!isRecord(entity)) {
      throw new Error(`Entity ${index + 1} must be an object`)
    }

    if (typeof entity.id !== 'string' || entity.id.trim() === '') {
      throw new Error(`Entity ${index + 1} needs an id`)
    }

    if (typeof entity.kind !== 'string' || !allowedEntityKinds.has(entity.kind as SaveEntityKind)) {
      throw new Error(`Entity ${index + 1} has an unsupported kind`)
    }

    const size = finiteNumber(entity.size, `Entity ${index + 1} size`)
    if (size <= 0 || size > 128) {
      throw new Error(`Entity ${index + 1} size must be between 1 and 128`)
    }

    return {
      id: entity.id,
      kind: entity.kind as SaveEntityKind,
      x: finiteNumber(entity.x, `Entity ${index + 1} x`),
      y: finiteNumber(entity.y, `Entity ${index + 1} y`),
      size,
    }
  })
}

function finiteNumber(value: unknown, label: string) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number`)
  }
  return Number(value.toFixed(3))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function formatMapMatrix(map: number[][]) {
  const rows = map.map((row) => `  [${row.join(', ')}]`).join(',\n')
  return `export const mapMatrix = [\n${rows},\n]\n`
}

function formatDefaultLevel(level: SaveLevelPayload) {
  const entities = level.entities.map(formatEntity).join(',\n')
  const entityList = entities ? `\n${entities},\n  ` : ''
  const angleLine =
    level.playerStart.a === 0 ? '' : `    a: ${formatNumber(level.playerStart.a)},\n`
  const imports = [
    level.entities.length > 0 ? "import { ASSET_IDS } from '../assets/asset-manifest.js'" : '',
    formatKeyImports(level.entities),
    "import { mapMatrix } from './map-matrix.js'",
    "import type { LevelDefinition } from '../types.js'",
  ]
    .filter(Boolean)
    .join('\n')

  return `${imports}

export const defaultLevel = {
  map: mapMatrix,
  playerStart: {
    x: ${formatNumber(level.playerStart.x)},
    y: ${formatNumber(level.playerStart.y)},
${angleLine}  },
  entities: [${entityList}],
} satisfies LevelDefinition
`
}

function formatKeyImports(entities: SaveLevelEntity[]) {
  const keyImports = []
  if (entities.some((entity) => entity.kind === 'greenKeycard')) {
    keyImports.push('KEY_GREEN')
  }
  if (entities.some((entity) => entity.kind === 'redKeycard')) {
    keyImports.push('KEY_RED')
  }

  return keyImports.length > 0
    ? `import { ${keyImports.sort().join(', ')} } from '../config/constants.js'`
    : ''
}

function formatEntity(entity: SaveLevelEntity) {
  if (entity.kind === 'enemyPatrol') {
    return `    {
      type: 'enemy',
      x: ${formatNumber(entity.x)},
      y: ${formatNumber(entity.y)},
      size: ${formatNumber(entity.size)},
      asset: [
        ASSET_IDS.sprites.enemyWalk1,
        ASSET_IDS.sprites.enemyWalk2,
        ASSET_IDS.sprites.enemyWalk3,
      ],
    }`
  }

  if (entity.kind === 'enemyGuard') {
    return `    {
      type: 'enemy',
      x: ${formatNumber(entity.x)},
      y: ${formatNumber(entity.y)},
      size: ${formatNumber(entity.size)},
      asset: ASSET_IDS.sprites.enemyGuard,
    }`
  }

  if (entity.kind === 'decoration') {
    return `    {
      type: 'sprite',
      x: ${formatNumber(entity.x)},
      y: ${formatNumber(entity.y)},
      size: ${formatNumber(entity.size)},
      asset: ASSET_IDS.sprites.decoration,
    }`
  }

  return `    {
      type: 'pickup',
      x: ${formatNumber(entity.x)},
      y: ${formatNumber(entity.y)},
      size: ${formatNumber(entity.size)},
      asset: ASSET_IDS.sprites.${entity.kind === 'redKeycard' ? 'redKeycard' : 'greenKeycard'},
      pickupType: ${entity.kind === 'redKeycard' ? 'KEY_RED' : 'KEY_GREEN'},
    }`
}

function formatNumber(value: number) {
  return Number(value.toFixed(3)).toString()
}
