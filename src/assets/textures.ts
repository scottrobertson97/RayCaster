import { createImageAsset } from './asset-manifest.js'
import { tileDefinitions } from '../data/tile-definitions.js'
import type { WallTextureArray } from '../types.js'

const walls: WallTextureArray = []

Object.values(tileDefinitions).forEach(tile => {
  if (tile.texture) {
    walls[tile.id] = createImageAsset(tile.texture)
  }
})

export { walls }
