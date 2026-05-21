import { norm } from '../math/geometry.js'

export function updateEnemies(state) {
  state.entities.enemies.forEach(enemy => enemy.update(state.world.player, norm, state.world.map))
}
