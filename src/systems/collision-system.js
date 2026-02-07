import { pointInsideAABB } from '../math/geometry.js'

export function resolveBulletCollisions(state) {
  const { bullets, enemies } = state.entityStore
  const map = state.map

  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i]
    if (!bullet.isAlive) {
      bullets.splice(i, 1)
      continue
    }

    const bulletTileX = Math.trunc(bullet.x) >> 6
    const bulletTileY = Math.trunc(bullet.y) >> 6

    if (
      bulletTileY < 0 ||
      bulletTileY >= map.length ||
      bulletTileX < 0 ||
      bulletTileX >= map[0].length
    ) {
      bullets.splice(i, 1)
      continue
    }

    if (map[bulletTileY][bulletTileX] > 0) {
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
