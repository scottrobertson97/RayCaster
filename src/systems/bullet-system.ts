import { norm } from '../math/geometry.js'
import type { GameState } from '../types.js'

export function updateBullets(state: GameState) {
  state.entities.bullets.forEach(bullet => bullet.update(state.world.player, norm, state.world.map))
}
