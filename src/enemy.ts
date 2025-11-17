import { Entity } from "./entity";
import { norm } from "./helper";

interface PlayerLike {
  x: number;
  y: number;
}

export class Enemy extends Entity {
  constructor(x: number, y: number, size: number, src: string | string[]) {
    super(x, y, size, src);
  }

  update(player: PlayerLike, _normFn: typeof norm, map: Array<number[]>) {
    const vecToPlayer = { x: player.x - this.x, y: player.y - this.y };
    const direction = norm(vecToPlayer);

    const oldX = Math.trunc(this.x) >> 6;
    const oldY = Math.trunc(this.y) >> 6;

    this.x += direction.x * this.speed;
    this.y += direction.y * this.speed;

    const newX = Math.trunc(this.x) >> 6;
    const newY = Math.trunc(this.y) >> 6;
    if (map[newY][newX] > 0) {
      if (newX !== oldX) {
        this.x -= direction.x * this.speed;
      }
      if (newY !== oldY) {
        this.y -= direction.y * this.speed;
      }
    }
  }
}
