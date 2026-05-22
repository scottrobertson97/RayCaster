import { DEFAULT_FOV, DEFAULT_HOR_RES } from '../config/constants.js'
import { GameMap } from '../map/game-map.js'

export function createGameState({ viewCanvas, mapCanvas, ctx, mapCtx, map, player, keyboard, walls }) {
  const entities = {
    bullets: [],
    enemies: [],
    pickups: [],
    getEntities() {
      return this.enemies.concat(this.bullets, this.pickups)
    },
  }

  return {
    world: {
      map,
      player,
      doors: {},
      inventory: {
        hasRedKeycard: false,
        hasGreenKeycard: false,
      },
    },
    entities,
    input: {
      keyboard,
    },
    ui: {
      notice: {
        text: '',
        timer: 0,
      },
      fpsCounterBuffer: 0,
      fpsLast: 0,
    },
    assets: {
      walls,
    },
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
    runtime: {
      lastTime: 0,
      dt: 0,
    },
  }
}
