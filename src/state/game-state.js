import { DEFAULT_FOV, DEFAULT_HOR_RES } from '../config/constants.js'
import { GameMap } from '../map/game-map.js'

export function createGameState({ viewCanvas, mapCanvas, ctx, mapCtx, map, player, keyboard, walls }) {
  const entityStore = {
    bullets: [],
    enemies: [],
    getEntities() {
      return this.enemies.concat(this.bullets)
    },
  }

  return {
    canvases: {
      view: viewCanvas,
      map: mapCanvas,
    },
    ctx,
    mapCtx,
    map,
    player,
    keyboard,
    walls,
    entityStore,
    doors: {},
    drawMap: false,
    fogEnabled: false,
    drawRays: true,
    fov: DEFAULT_FOV,
    horRes: DEFAULT_HOR_RES,
    halfHorRes: DEFAULT_HOR_RES / 2,
    lastTime: 0,
    dt: 0,
    rays: [],
    fpsCounterBuffer: 0,
    fpsLast: 0,
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
  }
}
