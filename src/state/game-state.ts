import { DEFAULT_FOV, DEFAULT_HOR_RES } from '../config/constants.js'
import { GameMap } from '../map/game-map.js'
import type { CreateGameStateOptions, EntityStore, GameState } from '../types.js'

export function createGameState({
  viewCanvas,
  mapCanvas,
  ctx,
  mapCtx,
  map,
  player,
  keyboard,
  walls,
}: CreateGameStateOptions): GameState {
  const entities: EntityStore = {
    bullets: [],
    enemies: [],
    pickups: [],
    sprites: [],
    getEntities() {
      return this.enemies.concat(this.bullets, this.pickups, this.sprites)
    },
  }

  return {
    // World state owns map geometry, actor state, doors, and inventory.
    world: {
      map,
      player,
      doors: {},
      inventory: {
        hasRedKeycard: false,
        hasGreenKeycard: false,
      },
    },
    // Entity collections are the source of truth for updatable/renderable actors.
    entities,
    // Input state is owned by input systems and snapshotted once per frame.
    input: {
      keyboard,
    },
    // UI state owns transient HUD values such as notices and FPS counters.
    ui: {
      notice: {
        text: '',
        timer: 0,
      },
      fpsCounterBuffer: 0,
      fpsLast: 0,
    },
    // Assets are read-only runtime references used by renderers.
    assets: {
      walls,
    },
    // Render state owns canvas handles, debug toggles, ray output, and view config.
    render: {
      canvases: {
        view: viewCanvas,
        map: mapCanvas,
      },
      ctx,
      mapCtx,
      drawMap: false,
      fogEnabled: false,
      drawRays: true,
      fov: DEFAULT_FOV,
      horRes: DEFAULT_HOR_RES,
      halfHorRes: DEFAULT_HOR_RES / 2,
      rays: [],
      fog: {
        START: 3 * GameMap.size,
        END: 9 * GameMap.size,
      },
      view: {
        get width() {
          return viewCanvas.width
        },
        get height() {
          return viewCanvas.height
        },
        get halfHeight() {
          return viewCanvas.height / 2
        },
      },
    },
    // Runtime state owns frame timing.
    runtime: {
      lastTime: 0,
      dt: 0,
    },
  }
}
