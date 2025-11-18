import { walls as defaultWalls } from "./textures";

interface DrawOptions {
  drawMap?: boolean;
  textures?: Array<HTMLImageElement | undefined>;
}

export class GameMap extends Array<number[]> {
  width: number;
  height: number;
  img: ImageData | null = null;

  constructor(m: number[][]) {
    super(...m);
    this.width = this[0].length;
    this.height = this.length;
  }

  setTile(x: number, y: number, i: number) {
    this[y][x] = i;
    this.img = null;
  }

  draw(
    ctx: CanvasRenderingContext2D,
    c: HTMLCanvasElement,
    { drawMap = false, textures = defaultWalls }: DrawOptions = {}
  ) {
    if (!drawMap) return
    if (this.img == null) {
      ctx.fillStyle = "gray";
      ctx.fillRect(0, 0, c.width, c.height);
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const xo = x * GameMap.size;
          const yo = y * GameMap.size;
          const i = this[y][x];
          const texture = textures[i];
          if (i > 0 && texture) {
            ctx.drawImage(texture, xo, yo, GameMap.size, GameMap.size);
          } else if (i > 0) {
            ctx.fillStyle = "red";
            ctx.fillRect(xo + 1, yo + 1, GameMap.size - 1, GameMap.size - 1);
          } else {
            ctx.fillStyle = "black";
            ctx.fillRect(xo + 1, yo + 1, GameMap.size - 1, GameMap.size - 1);
          }
        }
      }
      this.img = ctx.getImageData(0, 0, c.width, c.height);
    } else {
      ctx.putImageData(this.img, 0, 0);
    }
  }

  static get size() {
    return 64;
  }
}
