import { Entity } from './entity.js'
import { isSolidTileId } from '../data/tile-definitions.js'
import { norm } from '../math/geometry.js'
import { worldToTile } from '../math/tile-coordinates.js'
import type { AssetRef } from '../types.js'
import type { GameMap } from '../map/game-map.js'
import type { Player } from './player.js'

export class Enemy extends Entity {
  constructor(x: number, y: number, size: number, src: AssetRef | AssetRef[]) {
    super(x, y, size, src)
  }

  update(player: Player, _normFn: unknown, map: GameMap) {
    const vecToPlayer = { x: player.x - this.x, y: player.y - this.y }
    const direction = norm(vecToPlayer)

    const oldX = worldToTile(this.x)
    const oldY = worldToTile(this.y)

    this.x += direction.x * this.speed
    this.y += direction.y * this.speed

    const newX = worldToTile(this.x)
    const newY = worldToTile(this.y)

    if (isSolidTileId(map[newY][newX])) {
      if (newX !== oldX) {
        this.x -= direction.x * this.speed
      }
      if (newY !== oldY) {
        this.y -= direction.y * this.speed
      }
    }
  }
}
