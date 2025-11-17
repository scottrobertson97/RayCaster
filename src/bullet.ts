import { Entity } from "./entity";
import { norm, Point } from "./helper";

interface PlayerLike {
  x: number;
  y: number;
}

interface DrawOptions {
  fov?: number;
  drawMap?: boolean;
  height?: number;
  scale?: number;
}

export class Bullet extends Entity {
  direction: Point;
  isAlive: boolean;

  constructor(
    x: number,
    y: number,
    direction: Point,
    size: number,
    src: string | string[]
  ) {
    const dir =
      direction && (direction.x !== 0 || direction.y !== 0)
        ? norm(direction)
        : { x: Math.cos(0), y: Math.sin(0) };
    super(x + dir.x * 20, y + dir.y * 20, size, src);
    this.speed = 5;
    this.direction = dir;
    this.isAlive = true;
  }

  update(player: PlayerLike, normFn: typeof norm, map: Array<number[]>) {
    this.x += this.direction.x * this.speed;
    this.y += this.direction.y * this.speed;

    const newX = Math.trunc(this.x) >> 6;
    const newY = Math.trunc(this.y) >> 6;
    if (
      newY < 0 ||
      newY >= map.length ||
      newX < 0 ||
      newX >= map[0].length ||
      map[newY][newX] > 0
    ) {
      this.isAlive = false;
    }
  }

  draw(
    dt: number,
    player: PlayerLike,
    ctx: CanvasRenderingContext2D,
    map_ctx: CanvasRenderingContext2D,
    view: { width: number; height: number; halfHeight: number },
    options: DrawOptions = {}
  ) {
    super.draw(dt, player, ctx, map_ctx, view, {
      ...options,
      height: 0.4,
    });
  }
}
