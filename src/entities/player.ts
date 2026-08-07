import { ASSET_IDS } from '../assets/asset-manifest.js'
import {
  LOOK_PITCH_MAX_RAD,
  LOOK_PITCH_SPEED,
  PLAYER_HIT_COOLDOWN,
  PLAYER_MAX_HEALTH,
} from '../config/constants.js'
import { isSolidTileId } from '../data/tile-definitions.js'
import { worldToTile } from '../math/tile-coordinates.js'
import { Bullet } from './bullet.js'
import { norm } from '../math/geometry.js'
import { WorldObject } from './world-object.js'
import type { GameMap } from '../map/game-map.js'
import type { Keyboard } from '../input/keyboard-state.js'

export class Player extends WorldObject {
  a: number
  pitch: number
  speed: number
  lookSpeed: number
  dx: number
  dy: number
  maxHealth: number
  health: number
  hitCooldownRemaining: number

  constructor(x = 0, y = 0, a = 0, speed = 200, lookSpeed = 2) {
    super(x, y)
    this.a = a
    this.pitch = 0
    this.speed = speed
    this.lookSpeed = lookSpeed
    this.dx = Math.cos(this.a) * this.speed * (1 / 60)
    this.dy = Math.sin(this.a) * this.speed * (1 / 60)
    this.maxHealth = PLAYER_MAX_HEALTH
    this.health = this.maxHealth
    this.hitCooldownRemaining = 0
  }

  update(dt: number, kb: Keyboard, map: GameMap, spawnBullet: (bullet: Bullet) => void) {
    this.hitCooldownRemaining = Math.max(0, this.hitCooldownRemaining - dt)
    this.turn(dt, kb)
    this.look(dt, kb)
    this.move(dt, kb, map)
    this.shoot(kb, spawnBullet)
  }

  get isAlive() {
    return this.health > 0
  }

  takeDamage(amount: number) {
    if (!this.isAlive || this.hitCooldownRemaining > 0 || amount <= 0) {
      return false
    }

    this.health = Math.max(0, this.health - amount)
    this.hitCooldownRemaining = PLAYER_HIT_COOLDOWN
    return true
  }

  turn(dt: number, kb: Keyboard) {
    const d = kb.turn()
    if (!d) return

    this.a += this.lookSpeed * dt * d
    if (this.a > Math.PI * 2) this.a -= Math.PI * 2
    if (this.a < 0) this.a += Math.PI * 2
  }

  look(dt: number, kb: Keyboard) {
    const d = kb.lookPitch()
    if (!d) return

    this.pitch += d * LOOK_PITCH_SPEED * dt
    if (this.pitch > LOOK_PITCH_MAX_RAD) this.pitch = LOOK_PITCH_MAX_RAD
    if (this.pitch < -LOOK_PITCH_MAX_RAD) this.pitch = -LOOK_PITCH_MAX_RAD
  }

  move(dt: number, kb: Keyboard, map: GameMap) {
    const mapHeight = map.length
    const mapWidth = map[0]?.length ?? 0
    const tileAt = (tileX: number, tileY: number) => {
      if (tileY < 0 || tileY >= mapHeight || tileX < 0 || tileX >= mapWidth) {
        return true
      }
      return isSolidTileId(map[tileY][tileX])
    }

    const d = kb.move()
    this.dx = Math.cos(this.a) * this.speed * dt
    this.dy = Math.sin(this.a) * this.speed * dt
    if (!d) return

    const oldX = worldToTile(this.x)
    const oldY = worldToTile(this.y)
    const newX = worldToTile(this.x + this.dx * d)
    const newY = worldToTile(this.y + this.dy * d)

    if (
      !tileAt(newX, newY) ||
      newX === oldX ||
      (newY !== oldY && !tileAt(newX, oldY))
    ) {
      this.x += this.dx * d
    }

    if (
      !tileAt(newX, newY) ||
      newY === oldY ||
      (newX !== oldX && !tileAt(oldX, newY))
    ) {
      this.y += this.dy * d
    }
  }

  shoot(kb: Keyboard, spawnBullet?: (bullet: Bullet) => void) {
    if (!spawnBullet) return

    if (kb.actionPressed('fire')) {
      const direction = norm({ x: Math.cos(this.a), y: Math.sin(this.a) })
      spawnBullet(
        new Bullet(this.x, this.y, direction, 5, ASSET_IDS.sprites.bullet),
      )
    }
  }

  draw2D(ctx: CanvasRenderingContext2D, drawMap = false) {
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
