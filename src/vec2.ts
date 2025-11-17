export interface Vec2Props {
  x?: number;
  y?: number;
}

export class Vec2 {
  x: number;
  y: number;

  constructor({ x = 0, y = 0 }: Vec2Props) {
    this.x = x;
    this.y = y;
  }

  add(v: Vec2) {
    this.x += v.x;
    this.y += v.y;
  }

  scale(s: number) {
    this.x *= s;
    this.y *= s;
  }

  copy(): Vec2 {
    return new Vec2(this);
  }

  normalized(): Vec2 {
    const mag = Vec2.dist(this, new Vec2({}));
    return new Vec2({ x: this.x / mag, y: this.y / mag });
  }

  toString() {
    return `x: ${this.x} | y: ${this.y}`;
  }

  static add(v1: Vec2, v2: Vec2) {
    return { x: v1.x + v2.x, y: v1.y + v2.y };
  }

  static scale(v: Vec2, s: number) {
    return { x: v.x * s, y: v.y * s };
  }

  static copy(v: Vec2) {
    return new Vec2(v);
  }

  static normalized(v: Vec2) {
    const mag = Vec2.dist(v, new Vec2({}));
    return { x: v.x / mag, y: v.y / mag };
  }

  static dist(v1: Vec2, v2: Vec2) {
    return Math.sqrt(
      Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2)
    );
  }

  static crossProduct(v1: Vec2, v2: Vec2) {
    return v1.x * v2.y - v2.x * v1.y;
  }
}
