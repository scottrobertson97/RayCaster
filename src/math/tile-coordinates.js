export const TILE_SIZE = 64

// World/tile conversion intentionally preserves the existing 64-unit tile contract.
export function worldToTile(value) {
  return Math.trunc(value) >> 6
}

export function worldPointToTile(point) {
  return {
    x: worldToTile(point.x),
    y: worldToTile(point.y),
  }
}

export function tileToWorld(tile) {
  return tile * TILE_SIZE
}

export function tileCenter(tile) {
  return tileToWorld(tile) + TILE_SIZE * 0.5
}

export function tilePointCenter(tileX, tileY) {
  return {
    x: tileCenter(tileX),
    y: tileCenter(tileY),
  }
}

export function isTileInBounds(map, tileX, tileY) {
  return tileY >= 0 && tileY < map.height && tileX >= 0 && tileX < map.width
}

export function getTileKey(tileX, tileY) {
  return `${tileX},${tileY}`
}
