import { Entity } from './entity.js'
import {
  ENEMY_ATTACK_COOLDOWN,
  ENEMY_ATTACK_RANGE,
  ENEMY_ATTACK_DAMAGE,
  ENEMY_MOVE_SPEED,
} from '../config/constants.js'
import { isSolidTileId } from '../data/tile-definitions.js'
import { isTileInBounds, worldToTile } from '../math/tile-coordinates.js'
import type { AssetRef } from '../types.js'
import type { GameMap } from '../map/game-map.js'
import type { Player } from './player.js'

const ATTACK_RANGE_EPSILON = 0.01

export class Enemy extends Entity {
  attackCooldownRemaining: number

  constructor(x: number, y: number, size: number, src: AssetRef | AssetRef[]) {
    super(x, y, size, src)
    this.speed = ENEMY_MOVE_SPEED
    this.attackCooldownRemaining = 0
  }

  update(dt: number, player: Player, map: GameMap) {
    this.attackCooldownRemaining = Math.max(0, this.attackCooldownRemaining - dt)

    const dx = player.x - this.x
    const dy = player.y - this.y
    const distanceSquared = dx * dx + dy * dy

    const attackDistance = ENEMY_ATTACK_RANGE + ATTACK_RANGE_EPSILON
    if (distanceSquared <= attackDistance * attackDistance) {
      if (this.attackCooldownRemaining > 0) return false

      this.attackCooldownRemaining = ENEMY_ATTACK_COOLDOWN
      return player.takeDamage(ENEMY_ATTACK_DAMAGE)
    }

    const distance = Math.sqrt(distanceSquared)
    if (distance === 0) return false

    const maxStep = Math.max(0, distance - ENEMY_ATTACK_RANGE)
    const step = Math.min(this.speed * dt, maxStep)
    const stepX = (dx / distance) * step
    const stepY = (dy / distance) * step

    if (this.canOccupy(map, this.x + stepX, this.y)) {
      this.x += stepX
    }
    if (this.canOccupy(map, this.x, this.y + stepY)) {
      this.y += stepY
    }

    return false
  }

  private canOccupy(map: GameMap, x: number, y: number) {
    const tileX = worldToTile(x)
    const tileY = worldToTile(y)
    return isTileInBounds(map, tileX, tileY) && !isSolidTileId(map[tileY][tileX])
  }
}
