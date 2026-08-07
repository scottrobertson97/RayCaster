import { walls as defaultWalls } from '../assets/textures.js'
import { TILE_SIZE } from '../math/tile-coordinates.js'
import type { WallTextureArray } from '../types.js'

function isDrawableImage(image: HTMLImageElement | undefined): image is HTMLImageElement {
  return Boolean(image && image.complete && image.naturalWidth > 0 && image.naturalHeight > 0)
}

export class GameMap extends Array<number[]> {
  width: number
  height: number
  img: ImageData | null

  constructor(m: number[][]) {
    // A runtime map owns its rows because doors mutate tiles while they animate.
    // Sharing level-definition rows would leak opened doors into later restarts.
    super(...m.map(row => [...row]))
    this.width = this[0]?.length ?? 0
    this.height = this.length
    this.img = null
  }

  setTile(x: number, y: number, i: number) {
    this[y][x] = i
    // Tile mutation owns minimap cache invalidation.
    this.img = null
  }

  draw(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    { drawMap = false, textures = defaultWalls }: { drawMap?: boolean; textures?: WallTextureArray } = {},
  ) {
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
