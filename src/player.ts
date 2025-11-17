import { Vec2 } from "./vec2";
import { Keyboard } from "./keyboard";
import { Bullet } from "./bullet";
import { norm } from "./helper";

type SpawnBullet = (bullet: Bullet) => void;

export class Player {
  pos: Vec2;
  a: number;
  speed: number;
  lookSpeed: number;
  dx: number;
  dy: number;

  constructor(
    x = 0,
    y = 0,
    a = 0,
    speed = 200,
    lookSpeed = 2
  ) {
    this.pos = new Vec2({ x, y });
    this.a = a;
    this.speed = speed;
    this.lookSpeed = lookSpeed;
    this.dx = Math.cos(this.a) * this.speed * (1 / 60);
    this.dy = Math.sin(this.a) * this.speed * (1 / 60);
  }

  get x() {
    return this.pos.x;
  }
  get y() {
    return this.pos.y;
  }
  set x(val) {
    this.pos.x = val;
  }
  set y(val) {
    this.pos.y = val;
  }

  update(
    dt: number,
    kb: Keyboard,
    map: Array<number[]>,
    spawnBullet: SpawnBullet
  ) {
    this.turn(dt, kb);
    this.move(dt, kb, map);
    this.shoot(kb, spawnBullet);
  }

  turn(dt: number, kb: Keyboard) {
    const d = kb.turn();
    if (!d) return;
    this.a += this.lookSpeed * dt * d;
    if (this.a > Math.PI * 2) this.a -= Math.PI * 2;
    if (this.a < 0) this.a += Math.PI * 2;
  }

  move(dt: number, kb: Keyboard, map: Array<number[]>) {
    const d = kb.move();
    this.dx = Math.cos(this.a) * this.speed * dt;
    this.dy = Math.sin(this.a) * this.speed * dt;
    if (!d) return;
    const oldX = Math.trunc(this.x) >> 6;
    const oldY = Math.trunc(this.y) >> 6;
    const newX = Math.trunc(this.x + this.dx * d) >> 6;
    const newY = Math.trunc(this.y + this.dy * d) >> 6;
    if (
      !map[newY][newX] ||
      newX === oldX ||
      (newY !== oldY && !map[oldY][newX])
    ) {
      this.x += this.dx * d;
    }

    if (
      !map[newY][newX] ||
      newY === oldY ||
      (newX !== oldX && !map[newY][oldX])
    ) {
      this.y += this.dy * d;
    }
  }

  shoot(kb: Keyboard, spawnBullet?: SpawnBullet) {
    if (!spawnBullet) return;
    if (
      kb.keydown[Keyboard.KEYBOARD.KEY_SPACE] &&
      !kb.previousKeydown[Keyboard.KEYBOARD.KEY_SPACE]
    ) {
      const direction = norm({ x: Math.cos(this.a), y: Math.sin(this.a) });
      spawnBullet(
        new Bullet(this.x, this.y, direction, 5, "https://i.imgur.com/xrYTZhD.png")
      );
    }
  }

  draw2D(ctx: CanvasRenderingContext2D, drawMap = false) {
    if (drawMap) {
      ctx.fillStyle = "yellow";
      ctx.fillRect(this.x - 10, this.y - 10, 20, 20);
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.dx * 20, this.y + this.dy * 20);
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}
