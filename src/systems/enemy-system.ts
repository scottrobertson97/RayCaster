import { norm } from '../math/geometry.js'
import type { GameState } from '../types.js'

export function updateEnemies(state: GameState) {
  state.entities.enemies.forEach(enemy => enemy.update(state.world.player, norm, state.world.map))
}
