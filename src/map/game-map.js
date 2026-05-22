import { walls as defaultWalls } from '../assets/textures.js'
import { TILE_SIZE } from '../math/tile-coordinates.js'

function isDrawableImage(image) {
  return image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0
}

export class GameMap extends Array {
  constructor(m) {
    super(...m)
    this.width = this[0].length
    this.height = this.length
    this.img = null
  }

  setTile(x, y, i) {
    this[y][x] = i
    this.img = null
  }

  draw(ctx, canvas, { drawMap = false, textures = defaultWalls } = {}) {
    if (!drawMap) return

    if (this.img == null) {
      ctx.fillStyle = 'gray'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const xo = x * GameMap.size
          const yo = y * GameMap.size
          const i = this[y][x]
          const texture = textures[i]
          if (i > 0 && isDrawableImage(texture)) {
            ctx.drawImage(texture, xo, yo, GameMap.size, GameMap.size)
          } else if (i > 0) {
            ctx.fillStyle = 'red'
            ctx.fillRect(xo + 1, yo + 1, GameMap.size - 1, GameMap.size - 1)
          } else {
            ctx.fillStyle = 'black'
            ctx.fillRect(xo + 1, yo + 1, GameMap.size - 1, GameMap.size - 1)
          }
        }
      }

      this.img = ctx.getImageData(0, 0, canvas.width, canvas.height)
    } else {
      ctx.putImageData(this.img, 0, 0)
    }
  }

  static get size() {
    return TILE_SIZE
  }
}
