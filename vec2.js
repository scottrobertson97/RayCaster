class Vec2 {
  constructor({ x = 0, y = 0 }) {
    this.x = x;
    this.y = y;
  }
  add(v) {
    this.x += v.x;
    this.y += v.y;
  }
  scale(s) {
    this.x *= s;
    this.y *= s;
  }
  copy() {
    return new Vec2(this);
  }
  normalized() {
    let mag = Vec2.dist(this, new Vec2());
    return new Vec2(this.x / mag, this.y / mag);
  }
  toString() {
    return `x: ${this._x} | y: ${this._y}`;
  }
  static add(v1, v2) {
    return { x: v1.x + v2.x, y: v1.y + v2.y };
  }
  static scale(v, s) {
    return { x: (v.x *= s), y: v.y * s };
  }
  static copy(v) {
    return new Vec2(v);
  }
  static normalized(v) {
    let mag = Vec2.dist(v, new Vec2());
    return { x: v.x / mag, y: v.y / mag };
  }
  static toString(v) {
    return `x: ${v.x} | y: ${v.y}`;
  }
  static dist(v1, v2) {
    return Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2));
  }
  static crossProduct(v1, v2) {
    return v1.x * v2.y - v2.x * v1.y;
  }
}
