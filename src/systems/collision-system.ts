import { isSolidTileId } from '../data/tile-definitions.js'
import { pointInsideAABB } from '../math/geometry.js'
import { worldToTile } from '../math/tile-coordinates.js'
import type { GameState } from '../types.js'

export function resolveBulletCollisions(state: GameState) {
  const { bullets, enemies } = state.entities
  const map = state.world.map

  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i]
    if (!bullet.isAlive) {
      bullets.splice(i, 1)
      continue
    }

    const bulletTileX = worldToTile(bullet.x)
    const bulletTileY = worldToTile(bullet.y)

    if (
      bulletTileY < 0 ||
      bulletTileY >= map.length ||
      bulletTileX < 0 ||
      bulletTileX >= map[0].length
    ) {
      bullets.splice(i, 1)
      continue
    }

    if (isSolidTileId(map[bulletTileY][bulletTileX])) {
      bullets.splice(i, 1)
      continue
    }

    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j]
      if (pointInsideAABB(bullet.point, enemy.min, enemy.max)) {
        bullets.splice(i, 1)
        enemies.splice(j, 1)
        break
      }
    }
  }
}
