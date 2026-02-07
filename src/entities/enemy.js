import { Entity } from './entity.js'
import { norm } from '../math/geometry.js'

export class Enemy extends Entity {
  constructor(x, y, size, src) {
    super(x, y, size, src)
  }

  update(player, _normFn, map) {
    const vecToPlayer = { x: player.x - this.x, y: player.y - this.y }
    const direction = norm(vecToPlayer)

    const oldX = Math.trunc(this.x) >> 6
    const oldY = Math.trunc(this.y) >> 6

    this.x += direction.x * this.speed
    this.y += direction.y * this.speed

    const newX = Math.trunc(this.x) >> 6
    const newY = Math.trunc(this.y) >> 6

    if (map[newY][newX] > 0) {
      if (newX !== oldX) {
        this.x -= direction.x * this.speed
      }
      if (newY !== oldY) {
        this.y -= direction.y * this.speed
      }
    }
  }
}
