import { createImageAsset } from './asset-manifest.js'
import { tileDefinitions } from '../data/tile-definitions.js'

const walls = []

Object.values(tileDefinitions).forEach(tile => {
  if (tile.texture) {
    walls[tile.id] = createImageAsset(tile.texture)
  }
})

export { walls }
