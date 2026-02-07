import { norm } from '../math/geometry.js'

export function updateEnemies(state) {
  state.entityStore.enemies.forEach(enemy => enemy.update(state.player, norm, state.map))
}
