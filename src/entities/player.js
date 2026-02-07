import { Vec2 } from '../math/vec2.js'
import { Keyboard } from '../input/keyboard-state.js'
import { Bullet } from './bullet.js'
import { norm } from '../math/geometry.js'

export class Player {
  constructor(x = 0, y = 0, a = 0, speed = 200, lookSpeed = 2) {
    this.pos = new Vec2({ x, y })
    this.a = a
    this.speed = speed
    this.lookSpeed = lookSpeed
    this.dx = Math.cos(this.a) * this.speed * (1 / 60)
    this.dy = Math.sin(this.a) * this.speed * (1 / 60)
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

  update(dt, kb, map, spawnBullet) {
    this.turn(dt, kb)
    this.move(dt, kb, map)
    this.shoot(kb, spawnBullet)
  }

  turn(dt, kb) {
    const d = kb.turn()
    if (!d) return

    this.a += this.lookSpeed * dt * d
    if (this.a > Math.PI * 2) this.a -= Math.PI * 2
    if (this.a < 0) this.a += Math.PI * 2
  }

  move(dt, kb, map) {
    const d = kb.move()
    this.dx = Math.cos(this.a) * this.speed * dt
    this.dy = Math.sin(this.a) * this.speed * dt
    if (!d) return

    const oldX = Math.trunc(this.x) >> 6
    const oldY = Math.trunc(this.y) >> 6
    const newX = Math.trunc(this.x + this.dx * d) >> 6
    const newY = Math.trunc(this.y + this.dy * d) >> 6

    if (!map[newY][newX] || newX === oldX || (newY !== oldY && !map[oldY][newX])) {
      this.x += this.dx * d
    }

    if (!map[newY][newX] || newY === oldY || (newX !== oldX && !map[newY][oldX])) {
      this.y += this.dy * d
    }
  }

  shoot(kb, spawnBullet) {
    if (!spawnBullet) return

    if (
      kb.keydown[Keyboard.KEYBOARD.KEY_SPACE] &&
      !kb.previousKeydown[Keyboard.KEYBOARD.KEY_SPACE]
    ) {
      const direction = norm({ x: Math.cos(this.a), y: Math.sin(this.a) })
      spawnBullet(new Bullet(this.x, this.y, direction, 5, 'https://i.imgur.com/xrYTZhD.png'))
    }
  }

  draw2D(ctx, drawMap = false) {
    if (!drawMap) return

    ctx.fillStyle = 'yellow'
    ctx.fillRect(this.x - 10, this.y - 10, 20, 20)
    ctx.beginPath()
    ctx.moveTo(this.x, this.y)
    ctx.lineTo(this.x + this.dx * 20, this.y + this.dy * 20)
    ctx.strokeStyle = 'yellow'
    ctx.lineWidth = 1
    ctx.stroke()
  }
}
