import { Vec2 } from '../math/vec2.js'
import type { Point } from '../types.js'

export class WorldObject {
  pos: Vec2

  constructor(x = 0, y = 0) {
    this.pos = new Vec2({ x, y })
  }

  get x() {
    return this.pos.x
  }

  get y() {
    return this.pos.y
  }

  set x(val: number) {
    this.pos.x = val
  }

  set y(val: number) {
    this.pos.y = val
  }

  get point(): Point {
    return { x: this.x, y: this.y }
  }
}
