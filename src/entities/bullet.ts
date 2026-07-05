import { Entity } from './entity.js'
import { isSolidTileId } from '../data/tile-definitions.js'
import { norm } from '../math/geometry.js'
import { worldToTile } from '../math/tile-coordinates.js'
import type { AssetRef, Point } from '../types.js'
import type { GameMap } from '../map/game-map.js'
import type { Player } from './player.js'

export class Bullet extends Entity {
  direction: Point
  isAlive: boolean

  constructor(x: number, y: number, direction: Point, size: number, src: AssetRef) {
    const dir =
      direction && (direction.x !== 0 || direction.y !== 0)
        ? norm(direction)
        : { x: Math.cos(0), y: Math.sin(0) }

    super(x + dir.x * 20, y + dir.y * 20, size, src, 0.5, { height: 0.4 })
    this.speed = 5
    this.direction = dir
    this.isAlive = true
  }

  update(_player: Player, _normFn: unknown, map: GameMap) {
    this.x += this.direction.x * this.speed
    this.y += this.direction.y * this.speed

    const newX = worldToTile(this.x)
    const newY = worldToTile(this.y)
    if (
      newY < 0 ||
      newY >= map.length ||
      newX < 0 ||
      newX >= map[0].length ||
      isSolidTileId(map[newY][newX])
    ) {
      this.isAlive = false
    }
  }

}
