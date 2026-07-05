import { Vec2 } from '../math/vec2.js'

export class WorldObject {
  constructor(x = 0, y = 0) {
    this.pos = new Vec2({ x, y })
  }

  get x() {
    return this.pos.x
  }

  get y() {
    return this.pos.y
  }

  set x(val) {
    this.pos.x = val
  }

  set y(val) {
    this.pos.y = val
  }

  get point() {
    return { x: this.x, y: this.y }
  }
}
