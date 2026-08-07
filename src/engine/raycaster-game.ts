import {
  defaultAlwaysUpdateSystems,
  defaultRenderSystems,
  defaultUpdateSystems,
} from './default-systems.js'
import { GameRuntime } from './game-runtime.js'
import { GameMap } from '../map/game-map.js'
import { createGameState } from '../state/game-state.js'
import { initializeDoorsFromMap } from '../systems/door-system.js'
import { bindControls } from '../ui/controls.js'
import type {
  GameState,
  LevelRuntimeData,
  RaycasterGameOptions,
  RuntimeEntities,
} from '../types.js'

export function createRaycasterGame({
  viewCanvas,
  mapCanvas,
  map,
  player,
  keyboard,
  walls,
  entities = {},
  resetLevel,
  controlsRoot = document,
}: RaycasterGameOptions) {
  const ctx = viewCanvas.getContext('2d')
  const mapCtx = mapCanvas.getContext('2d')
  if (!ctx || !mapCtx) {
    throw new Error('RayCaster requires 2D canvas contexts')
  }

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
  seedEntities(state, entities)
  bindControls(state, controlsRoot)

  return new GameRuntime({
    state,
    alwaysUpdateSystems: defaultAlwaysUpdateSystems,
    updateSystems: defaultUpdateSystems,
    renderSystems: defaultRenderSystems,
    resetState: resetLevel
      ? currentState => resetRaycasterState(currentState, resetLevel())
      : undefined,
  })
}

function resetRaycasterState(state: GameState, level: LevelRuntimeData) {
  state.world.map = level.map
  state.world.player = level.player
  state.world.doors = {}
  state.world.inventory = {
    hasRedKeycard: false,
    hasGreenKeycard: false,
  }

  state.entities.enemies.length = 0
  state.entities.bullets.length = 0
  state.entities.pickups.length = 0
  state.entities.sprites.length = 0
  seedEntities(state, level.entities)

  state.ui.notice.text = ''
  state.ui.notice.timer = 0
  state.ui.damageFlashTimer = 0
  state.ui.hitMarkerTimer = 0
  state.ui.fpsCounterBuffer = 0
  state.ui.fpsLast = 0
  state.render.rays = []

  state.runtime.phase = 'playing'
  state.runtime.restartRequested = false
  state.runtime.dt = 0
  state.runtime.lastTime = performance.now()

  setupCanvas(state)
  initializeDoorsFromMap(state)
}

function setupCanvas(state: GameState) {
  state.render.canvases.map.width = state.world.map[0].length * GameMap.size
  state.render.canvases.map.height = state.world.map.length * GameMap.size
  state.render.mapCtx.imageSmoothingEnabled = false
  state.render.ctx.imageSmoothingEnabled = false
}

function seedEntities(state: GameState, entities: Partial<RuntimeEntities>) {
  state.entities.enemies.push(...(entities.enemies ?? []))
  state.entities.bullets.push(...(entities.bullets ?? []))
  state.entities.pickups.push(...(entities.pickups ?? []))
  state.entities.sprites.push(...(entities.sprites ?? []))
}
