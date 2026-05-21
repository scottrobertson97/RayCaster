import { defaultRenderSystems, defaultUpdateSystems } from './default-systems.js'
import { GameRuntime } from './game-runtime.js'
import { GameMap } from '../map/game-map.js'
import { createGameState } from '../state/game-state.js'
import { initializeDoorsFromMap } from '../systems/door-system.js'
import { initializeKeycardsFromMap } from '../systems/keycard-system.js'
import { bindControls } from '../ui/controls.js'

export function createRaycasterGame({
  viewCanvas,
  mapCanvas,
  map,
  player,
  keyboard,
  walls,
  entities = {},
  controlsRoot = document,
}) {
  const ctx = viewCanvas.getContext('2d')
  const mapCtx = mapCanvas.getContext('2d')

  const state = createGameState({
    viewCanvas,
    mapCanvas,
    ctx,
    mapCtx,
    map,
    player,
    keyboard,
    walls,
  })

  setupCanvas(state)
  initializeDoorsFromMap(state)
  initializeKeycardsFromMap(state)
  seedEntities(state, entities)
  bindControls(state, controlsRoot)

  return new GameRuntime({
    state,
    updateSystems: defaultUpdateSystems,
    renderSystems: defaultRenderSystems,
  })
}

function setupCanvas(state) {
  state.render.canvases.map.width = state.world.map[0].length * GameMap.size
  state.render.canvases.map.height = state.world.map.length * GameMap.size
  state.render.mapCtx.imageSmoothingEnabled = false
  state.render.ctx.imageSmoothingEnabled = false
}

function seedEntities(state, entities) {
  state.entities.enemies.push(...(entities.enemies ?? []))
  state.entities.bullets.push(...(entities.bullets ?? []))
  state.entities.pickups.push(...(entities.pickups ?? []))
}
