import type { Point } from '../types.js'
import type { GameMap } from '../map/game-map.js'

export const TILE_SIZE = 64

// World/tile conversion intentionally preserves the existing 64-unit tile contract.
export function worldToTile(value: number) {
  return Math.trunc(value) >> 6
}

export function worldPointToTile(point: Point): Point {
  return {
    x: worldToTile(point.x),
    y: worldToTile(point.y),
  }
}

export function tileToWorld(tile: number) {
  return tile * TILE_SIZE
}

export function tileCenter(tile: number) {
  return tileToWorld(tile) + TILE_SIZE * 0.5
}

export function tilePointCenter(tileX: number, tileY: number): Point {
  return {
    x: tileCenter(tileX),
    y: tileCenter(tileY),
  }
}

export function isTileInBounds(map: GameMap, tileX: number, tileY: number) {
  return tileY >= 0 && tileY < map.height && tileX >= 0 && tileX < map.width
}

export function getTileKey(tileX: number, tileY: number) {
  return `${tileX},${tileY}`
}
