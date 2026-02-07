import { norm } from '../math/geometry.js'

export function updateBullets(state) {
  state.entityStore.bullets.forEach(bullet => bullet.update(state.player, norm, state.map))
}
