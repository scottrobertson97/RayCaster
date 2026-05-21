import { norm } from '../math/geometry.js'

export function updateBullets(state) {
  state.entities.bullets.forEach(bullet => bullet.update(state.world.player, norm, state.world.map))
}
