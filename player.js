class Player {
  constructor(x = 0, y = 0, a = 0, speed = 200, lookSpeed = 2) {
    this.pos = new Vec2({ x, y });
    this.a = a;
    this.speed = speed;
    this.lookSpeed = lookSpeed;
    this.ctx = ctx;
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

  update(dt, kb, map) {
    this.turn(dt, kb);
    this.move(dt, kb, map);
    this.shoot(kb);
  }

  turn(dt, kb) {
    let d = kb.turn();
    if (!d) return;
    this.a += this.lookSpeed * dt * d;
    if (this.a > Math.PI * 2) this.a -= Math.PI * 2;
    if (this.a < 0) this.a += Math.PI * 2;
  }

  move(dt, kb, map) {
    let d = kb.move();
    this.dx = Math.cos(this.a) * this.speed * dt;
    this.dy = Math.sin(this.a) * this.speed * dt;
    if (!d) return;
    let oldX = Math.trunc(this.x) >> 6;
    let oldY = Math.trunc(this.y) >> 6;
    let newX = Math.trunc(this.x + this.dx * d) >> 6;
    let newY = Math.trunc(this.y + this.dy * d) >> 6;
    if (
      !map[newY][newX] || // new square is not a wall (will clip around corners)
      newX == oldX || // havent moved into a new square left or right
      (newY != oldY && !map[oldY][newX]) // moved  diagonally but not abstructed left or right
    )
      this.x = this.x + this.dx * d;

    if (!map[newY][newX] || newY == oldY || (newX != oldX && !map[newY][oldX]))
      this.y = this.y + this.dy * d;
  }

  shoot(kb) {
    if (
      kb.keydown[Keyboard.KEYBOARD.KEY_SPACE] &&
      !kb.previousKeydown[Keyboard.KEYBOARD.KEY_SPACE]
    ) {
      bullets.push(
        new Bullet(this.x, this.y, 5, "https://i.imgur.com/xrYTZhD.png")
      );
    }
  }

  draw2D(ctx) {
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
