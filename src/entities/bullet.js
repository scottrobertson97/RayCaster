import { Entity } from './entity.js'
import { norm } from '../math/geometry.js'

export class Bullet extends Entity {
  constructor(x, y, direction, size, src) {
    const dir =
      direction && (direction.x !== 0 || direction.y !== 0)
        ? norm(direction)
        : { x: Math.cos(0), y: Math.sin(0) }

    super(x + dir.x * 20, y + dir.y * 20, size, src, 0.5, { height: 0.4 })
    this.speed = 5
    this.direction = dir
    this.isAlive = true
  }

  update(_player, _normFn, map) {
    this.x += this.direction.x * this.speed
    this.y += this.direction.y * this.speed

    const newX = Math.trunc(this.x) >> 6
    const newY = Math.trunc(this.y) >> 6
    if (
      newY < 0 ||
      newY >= map.length ||
      newX < 0 ||
      newX >= map[0].length ||
      map[newY][newX] > 0
    ) {
      this.isAlive = false
    }
  }

}
