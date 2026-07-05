import type { Point } from '../types.js'

export class Vec2 {
  x: number
  y: number

  constructor({ x = 0, y = 0 }: Partial<Point> = {}) {
    this.x = x
    this.y = y
  }

  add(v: Point) {
    this.x += v.x
    this.y += v.y
  }

  scale(s: number) {
    this.x *= s
    this.y *= s
  }

  copy() {
    return new Vec2(this)
  }

  normalized() {
    const mag = Vec2.dist(this, new Vec2())
    return new Vec2({ x: this.x / mag, y: this.y / mag })
  }

  toString() {
    return `x: ${this.x} | y: ${this.y}`
  }

  static add(v1: Point, v2: Point) {
    return new Vec2({ x: v1.x + v2.x, y: v1.y + v2.y })
  }

  static scale(v: Point, s: number) {
    return new Vec2({ x: v.x * s, y: v.y * s })
  }

  static copy(v: Point) {
    return new Vec2(v)
  }

  static normalized(v: Point) {
    const mag = Vec2.dist(v, new Vec2())
    return new Vec2({ x: v.x / mag, y: v.y / mag })
  }

  static dist(v1: Point, v2: Point) {
    return Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2))
  }

  static crossProduct(v1: Point, v2: Point) {
    return v1.x * v2.y - v2.x * v1.y
  }
}
