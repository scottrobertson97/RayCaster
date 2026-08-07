import { drawEntities2D, drawRaycastScene } from '../render/entity-renderer.js'
import { drawUI } from '../render/ui-renderer.js'
import { updateBullets } from '../systems/bullet-system.js'
import { resolveBulletCollisions } from '../systems/collision-system.js'
import { handleDoorActivation, updateDoors } from '../systems/door-system.js'
import { updateEnemies } from '../systems/enemy-system.js'
import { updateGameSession } from '../systems/game-session-system.js'
import { updateKeycardPickups } from '../systems/keycard-system.js'
import { updatePlayer } from '../systems/player-system.js'
import type { GameState, System } from '../types.js'

export const defaultAlwaysUpdateSystems: System[] = [
  { name: 'gameSession', run: updateGameSession },
]

export const defaultUpdateSystems: System[] = [
  { name: 'player', run: updatePlayer },
  { name: 'keycardPickups', run: updateKeycardPickups },
  { name: 'doorActivation', run: handleDoorActivation },
  { name: 'doors', run: updateDoors },
  { name: 'enemies', run: updateEnemies },
  { name: 'bullets', run: updateBullets },
  { name: 'bulletCollisions', run: resolveBulletCollisions },
]

export const defaultRenderSystems: System[] = [
  {
    name: 'map',
    run(state: GameState) {
      state.world.map.draw(state.render.mapCtx, state.render.canvases.map, {
        drawMap: state.render.drawMap,
        textures: state.assets.walls,
      })
    },
  },
  { name: 'raycastScene', run: drawRaycastScene },
  {
    name: 'player2D',
    run(state: GameState) {
      state.world.player.draw2D(state.render.mapCtx, state.render.drawMap)
    },
  },
  { name: 'entities2D', run: drawEntities2D },
  { name: 'ui', run: drawUI },
]
