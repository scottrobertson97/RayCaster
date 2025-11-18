// src/textures.ts
var walls = [];
var imgSrcs = [
  "",
  "https://i.imgur.com/7B86fSv.png",
  "https://i.imgur.com/vSDbzMX.png"
];
imgSrcs.forEach((src, i) => {
  const img = new Image();
  img.src = src;
  img.setAttribute("crossOrigin", "");
  walls[i] = img;
});

// src/map.ts
var GameMap = class _GameMap extends Array {
  constructor(m) {
    super(...m);
    this.img = null;
    this.width = this[0].length;
    this.height = this.length;
  }
  setTile(x, y, i) {
    this[y][x] = i;
    this.img = null;
  }
  draw(ctx2, c2, { drawMap: drawMap2 = false, textures = walls } = {}) {
    if (!drawMap2) return;
    if (this.img == null) {
      ctx2.fillStyle = "gray";
      ctx2.fillRect(0, 0, c2.width, c2.height);
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const xo = x * _GameMap.size;
          const yo = y * _GameMap.size;
          const i = this[y][x];
          const texture = textures[i];
          if (i > 0 && texture) {
            ctx2.drawImage(texture, xo, yo, _GameMap.size, _GameMap.size);
          } else if (i > 0) {
            ctx2.fillStyle = "red";
            ctx2.fillRect(xo + 1, yo + 1, _GameMap.size - 1, _GameMap.size - 1);
          } else {
            ctx2.fillStyle = "black";
            ctx2.fillRect(xo + 1, yo + 1, _GameMap.size - 1, _GameMap.size - 1);
          }
        }
      }
      this.img = ctx2.getImageData(0, 0, c2.width, c2.height);
    } else {
      ctx2.putImageData(this.img, 0, 0);
    }
  }
  static get size() {
    return 64;
  }
};

// src/vec2.ts
var Vec2 = class _Vec2 {
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
    return new _Vec2(this);
  }
  normalized() {
    const mag = _Vec2.dist(this, new _Vec2({}));
    return new _Vec2({ x: this.x / mag, y: this.y / mag });
  }
  toString() {
    return `x: ${this.x} | y: ${this.y}`;
  }
  static add(v1, v2) {
    return { x: v1.x + v2.x, y: v1.y + v2.y };
  }
  static scale(v, s) {
    return { x: v.x * s, y: v.y * s };
  }
  static copy(v) {
    return new _Vec2(v);
  }
  static normalized(v) {
    const mag = _Vec2.dist(v, new _Vec2({}));
    return { x: v.x / mag, y: v.y / mag };
  }
  static dist(v1, v2) {
    return Math.sqrt(
      Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2)
    );
  }
  static crossProduct(v1, v2) {
    return v1.x * v2.y - v2.x * v1.y;
  }
};

// src/keyboard.ts
var Keyboard = class _Keyboard {
  constructor(logKeystrokes = false) {
    this.keydown = [];
    this.previousKeydown = [];
    this.logKeystrokes = logKeystrokes;
    const _this = this;
    window.addEventListener(
      "keydown",
      function(e) {
        if (logKeystrokes) console.log("keydown=" + e.keyCode);
        _this.keydown[e.keyCode] = true;
      }.bind(this)
    );
    window.addEventListener(
      "keyup",
      function(e) {
        if (logKeystrokes) console.log("keyup=" + e.keyCode);
        _this.keydown[e.keyCode] = false;
      }.bind(this)
    );
  }
  move() {
    let d = 0;
    if (this.keydown[_Keyboard.KEYBOARD.KEY_UP] || this.keydown[_Keyboard.KEYBOARD.KEY_W]) {
      d += 1;
    }
    if (this.keydown[_Keyboard.KEYBOARD.KEY_DOWN] || this.keydown[_Keyboard.KEYBOARD.KEY_S]) {
      d -= 1;
    }
    return d;
  }
  turn() {
    let d = 0;
    if (this.keydown[_Keyboard.KEYBOARD.KEY_RIGHT] || this.keydown[_Keyboard.KEYBOARD.KEY_D]) {
      d += 1;
    }
    if (this.keydown[_Keyboard.KEYBOARD.KEY_LEFT] || this.keydown[_Keyboard.KEYBOARD.KEY_A]) {
      d -= 1;
    }
    return d;
  }
  static {
    this.KEYBOARD = {
      KEY_LEFT: 37,
      KEY_UP: 38,
      KEY_RIGHT: 39,
      KEY_DOWN: 40,
      KEY_SPACE: 32,
      KEY_SHIFT: 16,
      KEY_W: 87,
      KEY_S: 83,
      KEY_A: 65,
      KEY_D: 68
    };
  }
};

// src/helper.ts
function lineIntersect(l, r) {
  return lineSegmentTouchesOrCrossesLine(l, r) && lineSegmentTouchesOrCrossesLine(r, l);
}
function AABBIntersect(a1, a2, b1, b2) {
  return a1.x <= b2.x && a2.x >= b1.x && a1.y <= b2.y && a2.y >= b1.y;
}
function pointInsideAABB(p, b1, b2) {
  return AABBIntersect(p, p, b1, b2);
}
function pointRightOfLine(l, p) {
  const a = { x: l.x2 - l.x1, y: l.y2 - l.y1 };
  const b = { x: p.x - l.x1, y: p.y - l.y1 };
  return crossProduct(a, b) < 0;
}
function crossProduct(a, b) {
  return a.x * b.y - b.x * a.y;
}
function lineSegmentTouchesOrCrossesLine(a, b) {
  const r1 = pointRightOfLine(a, { x: b.x1, y: b.y1 });
  const r2 = pointRightOfLine(a, { x: b.x2, y: b.y2 });
  return r1 && !r2 || !r1 && r2;
}
function dist(ax, ay, bx, by) {
  return Math.sqrt(Math.pow(bx - ax, 2) + Math.pow(by - ay, 2));
}
function norm(vec) {
  const mag = dist(vec.x, vec.y, 0, 0);
  return { x: vec.x / mag, y: vec.y / mag };
}

// src/entity.ts
var Entity = class {
  constructor(x, y, size, src, frameRate = 0.5) {
    this.drawn = false;
    this.speed = 0.2;
    this.frameIndex = 0;
    this.frameTick = 0;
    this.x = x;
    this.y = y;
    this.size = size;
    this.frameRate = frameRate;
    if (Array.isArray(src)) {
      this.imgs = [];
      this.imgRatios = [];
      for (const srcURL of src) {
        const img = new Image();
        img.onload = () => {
          this.imgRatios?.push(img.width / img.height);
        };
        img.src = srcURL;
        img.setAttribute("crossOrigin", "");
        this.imgs.push(img);
      }
    } else {
      this.img = new Image();
      this.img.onload = () => {
        this.imgRatio = this.img?.width / this.img?.height;
      };
      this.img.src = src;
      this.img.setAttribute("crossOrigin", "");
    }
  }
  get max() {
    return { x: this.x + this.size, y: this.y + this.size };
  }
  get min() {
    return { x: this.x - this.size, y: this.y - this.size };
  }
  get point() {
    return { x: this.x, y: this.y };
  }
  draw(dt2, player2, ctx2, map_ctx2, view2, { fov: fov2 = 90, drawMap: drawMap2 = false, height = 1 } = {}) {
    if (!this.imgRatio && this.img) {
      this.imgRatio = this.img.width / this.img.height;
    }
    const disT = dist(player2.x, player2.y, this.x, this.y);
    const minT = player2.a - fov2 / 2 * (Math.PI / 180);
    const maxT = player2.a + fov2 / 2 * (Math.PI / 180);
    const x = this.x - player2.x;
    const y = this.y - player2.y;
    let t = Math.atan(y / x);
    if (y < 0 && x > 0) {
      t += Math.PI * 2;
    } else if (y > 0 && x < 0 || y < 0 && x < 0) {
      t += Math.PI;
    }
    const ca = player2.a - t;
    const correctedDistance = disT * Math.cos(ca);
    const lineH = Math.trunc(GameMap.size * view2.height * height / correctedDistance);
    const lineO = view2.halfHeight * 0.75 - Math.trunc(lineH / 2);
    if (drawMap2) {
      this.drawTracerLine(map_ctx2, player2);
    }
    const _imgRatio = this.img ? this.imgRatio ?? 1 : this.imgRatios?.[this.frameIndex] ?? 1;
    const width = lineH * _imgRatio;
    let percent = (t - minT) / (maxT - minT);
    if (minT < 0 && t > player2.a + Math.PI) {
      percent = (t - minT - Math.PI * 2) / (maxT - minT);
    } else if (maxT > Math.PI * 2 && t < player2.a - Math.PI) {
      percent = (t - minT + Math.PI * 2) / (maxT - minT);
    }
    const CX = percent * view2.width - width / 2;
    if (this.img) {
      ctx2.drawImage(this.img, CX, lineO, width, lineH);
    } else if (this.imgs) {
      ctx2.drawImage(this.imgs[this.frameIndex], CX, lineO, width, lineH);
      this.frameTick += dt2;
      if (this.frameTick > this.frameRate) {
        this.frameTick = 0;
        this.frameIndex++;
        if (this.frameIndex >= this.imgs.length) this.frameIndex = 0;
      }
    }
  }
  draw2D(ctx2, drawMap2 = false) {
    if (drawMap2) {
      ctx2.beginPath();
      ctx2.moveTo(this.x - this.size, this.y - this.size);
      ctx2.lineTo(this.x + this.size, this.y - this.size);
      ctx2.lineTo(this.x + this.size, this.y + this.size);
      ctx2.lineTo(this.x - this.size, this.y + this.size);
      ctx2.lineTo(this.x - this.size, this.y - this.size);
      ctx2.strokeStyle = "green";
      ctx2.lineWidth = 1;
      ctx2.stroke();
    }
  }
  update(player2, normFn, map2) {
  }
  drawTracerLine(map_ctx2, player2) {
    map_ctx2.strokeStyle = "blue";
    map_ctx2.lineWidth = 5;
    map_ctx2.beginPath();
    map_ctx2.moveTo(this.x + this.size, this.y - this.size);
    map_ctx2.lineTo(this.x - this.size, this.y + this.size);
    map_ctx2.stroke();
    map_ctx2.beginPath();
    map_ctx2.moveTo(this.x - this.size, this.y - this.size);
    map_ctx2.lineTo(this.x + this.size, this.y + this.size);
    map_ctx2.stroke();
    map_ctx2.beginPath();
    map_ctx2.moveTo(player2.x, player2.y);
    map_ctx2.lineTo(this.x, this.y);
    map_ctx2.strokeStyle = "green";
    map_ctx2.lineWidth = 5;
    map_ctx2.stroke();
  }
};

// src/bullet.ts
var Bullet = class extends Entity {
  constructor(x, y, direction, size, src) {
    const dir = direction && (direction.x !== 0 || direction.y !== 0) ? norm(direction) : { x: Math.cos(0), y: Math.sin(0) };
    super(x + dir.x * 20, y + dir.y * 20, size, src);
    this.speed = 5;
    this.direction = dir;
    this.isAlive = true;
  }
  update(player2, normFn, map2) {
    this.x += this.direction.x * this.speed;
    this.y += this.direction.y * this.speed;
    const newX = Math.trunc(this.x) >> 6;
    const newY = Math.trunc(this.y) >> 6;
    if (newY < 0 || newY >= map2.length || newX < 0 || newX >= map2[0].length || map2[newY][newX] > 0) {
      this.isAlive = false;
    }
  }
  draw(dt2, player2, ctx2, map_ctx2, view2, options = {}) {
    super.draw(dt2, player2, ctx2, map_ctx2, view2, {
      ...options,
      height: 0.4
    });
  }
};

// src/player.ts
var Player = class {
  constructor(x = 0, y = 0, a = 0, speed = 200, lookSpeed = 2) {
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
  update(dt2, kb, map2, spawnBullet2) {
    this.turn(dt2, kb);
    this.move(dt2, kb, map2);
    this.shoot(kb, spawnBullet2);
  }
  turn(dt2, kb) {
    const d = kb.turn();
    if (!d) return;
    this.a += this.lookSpeed * dt2 * d;
    if (this.a > Math.PI * 2) this.a -= Math.PI * 2;
    if (this.a < 0) this.a += Math.PI * 2;
  }
  move(dt2, kb, map2) {
    const d = kb.move();
    this.dx = Math.cos(this.a) * this.speed * dt2;
    this.dy = Math.sin(this.a) * this.speed * dt2;
    if (!d) return;
    const oldX = Math.trunc(this.x) >> 6;
    const oldY = Math.trunc(this.y) >> 6;
    const newX = Math.trunc(this.x + this.dx * d) >> 6;
    const newY = Math.trunc(this.y + this.dy * d) >> 6;
    if (!map2[newY][newX] || newX === oldX || newY !== oldY && !map2[oldY][newX]) {
      this.x += this.dx * d;
    }
    if (!map2[newY][newX] || newY === oldY || newX !== oldX && !map2[newY][oldX]) {
      this.y += this.dy * d;
    }
  }
  shoot(kb, spawnBullet2) {
    if (!spawnBullet2) return;
    if (kb.keydown[Keyboard.KEYBOARD.KEY_SPACE] && !kb.previousKeydown[Keyboard.KEYBOARD.KEY_SPACE]) {
      const direction = norm({ x: Math.cos(this.a), y: Math.sin(this.a) });
      spawnBullet2(
        new Bullet(this.x, this.y, direction, 5, "https://i.imgur.com/xrYTZhD.png")
      );
    }
  }
  draw2D(ctx2, drawMap2 = false) {
    if (drawMap2) {
      ctx2.fillStyle = "yellow";
      ctx2.fillRect(this.x - 10, this.y - 10, 20, 20);
      ctx2.beginPath();
      ctx2.moveTo(this.x, this.y);
      ctx2.lineTo(this.x + this.dx * 20, this.y + this.dy * 20);
      ctx2.strokeStyle = "yellow";
      ctx2.lineWidth = 1;
      ctx2.stroke();
    }
  }
};

// src/enemy.ts
var Enemy = class extends Entity {
  constructor(x, y, size, src) {
    super(x, y, size, src);
  }
  update(player2, _normFn, map2) {
    const vecToPlayer = { x: player2.x - this.x, y: player2.y - this.y };
    const direction = norm(vecToPlayer);
    const oldX = Math.trunc(this.x) >> 6;
    const oldY = Math.trunc(this.y) >> 6;
    this.x += direction.x * this.speed;
    this.y += direction.y * this.speed;
    const newX = Math.trunc(this.x) >> 6;
    const newY = Math.trunc(this.y) >> 6;
    if (map2[newY][newX] > 0) {
      if (newX !== oldX) {
        this.x -= direction.x * this.speed;
      }
      if (newY !== oldY) {
        this.y -= direction.y * this.speed;
      }
    }
  }
};

// src/index.ts
window.addEventListener("load", init);
var c = document.getElementById("view");
var ctx = c.getContext("2d");
var map_c = document.getElementById("map");
var map_ctx = map_c.getContext("2d");
var drawMap = false;
var fogEnabled = false;
var P2 = Math.PI / 2;
var P3 = 3 * Math.PI / 2;
var TWO_PI = Math.PI * 2;
var DR = Math.PI / 180;
var RD = 180 / Math.PI;
var DOF = 100;
var FOG = { START: 3 * GameMap.size, END: 9 * GameMap.size };
var view = {
  get width() {
    return c.width;
  },
  get height() {
    return c.height;
  },
  get halfHeight() {
    return c.height / 2;
  }
};
var fov = 90;
var horRes = 8;
var halfHorRes = horRes / 2;
var drawRays = true;
function updateHorRes(num) {
  horRes = Number(num);
  halfHorRes = horRes / 2;
}
function normalizeAngle(angle) {
  angle %= TWO_PI;
  return angle < 0 ? angle + TWO_PI : angle;
}
var entityStore = {
  bullets: [],
  enemies: [],
  getEntities() {
    return this.enemies.concat(this.bullets);
  }
};
var { bullets, enemies } = entityStore;
var spawnBullet = (bullet) => {
  entityStore.bullets.push(bullet);
};
var mapMatrix = [
  [1, 2, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 1],
  [1, 0, 2, 0, 0, 2, 1, 0, 0, 0, 0, 2, 2],
  [1, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 2, 2],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 2],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [1, 0, 2, 0, 0, 3, 1, 0, 0, 0, 0, 2, 2],
  [1, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 2, 2],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];
var map = new GameMap(mapMatrix);
var myKeys = new Keyboard();
var player = new Player(300, 300);
enemies.push(new Enemy(600, 450, 10, "https://i.imgur.com/FcIXhVp.png"));
enemies.push(
  new Enemy(200, 700, 10, [
    "https://i.imgur.com/rAFkpSc.png",
    "https://i.imgur.com/rYCrqax.png",
    "https://i.imgur.com/p5w5cCU.png"
  ])
);
insetSprite();
var lastTime = 0;
var dt = 0;
function init() {
  document.querySelectorAll('input[type="radio"][name="quality"]').forEach((r) => {
    r.addEventListener("change", changeQualityHandler);
  });
  updateHorRes(8);
  map_c.width = map[0].length * GameMap.size;
  map_c.height = map.length * GameMap.size;
  map_ctx.imageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;
  window.toggleMap = toggleMap;
  window.toggleFog = toggleFog;
  update();
}
function insetSprite() {
  enemies.push(new Entity(600, 750, 40, "https://i.imgur.com/rgwwS0K.png"));
}
function update() {
  dt = calculateDeltaTime();
  player.update(dt, myKeys, map, spawnBullet);
  updateEntities();
  draw(dt);
  myKeys.previousKeydown = myKeys.keydown.slice();
  requestAnimationFrame(update);
}
function draw(dt2) {
  map.draw(map_ctx, map_c, { drawMap, textures: walls });
  drawRays2D(dt2);
  player.draw2D(map_ctx, drawMap);
  drawEntities();
  drawUI();
}
function getEntities() {
  return entityStore.getEntities();
}
function forEachEntity(callback) {
  getEntities().forEach(callback);
}
function resolveBulletCollisions() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    if (!bullet.isAlive) {
      bullets.splice(i, 1);
      continue;
    }
    const bulletTileX = Math.trunc(bullet.x) >> 6;
    const bulletTileY = Math.trunc(bullet.y) >> 6;
    if (bulletTileY < 0 || bulletTileY >= map.length || bulletTileX < 0 || bulletTileX >= map[0].length) {
      bullets.splice(i, 1);
      continue;
    }
    if (map[bulletTileY][bulletTileX] > 0) {
      bullets.splice(i, 1);
      continue;
    }
    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];
      if (pointInsideAABB(bullet.point, enemy.min, enemy.max)) {
        bullets.splice(i, 1);
        enemies.splice(j, 1);
        break;
      }
    }
  }
}
function updateEntities() {
  forEachEntity((e) => e.update(player, norm, map));
  resolveBulletCollisions();
}
function drawEntities() {
  forEachEntity((e) => e.draw2D(map_ctx, drawMap));
}
function drawRays2D(dt2) {
  fillSceneBackground();
  const visibleEntities = getEntities();
  visibleEntities.forEach((entity) => {
    entity.drawn = false;
  });
  const rays = castSceneRays(visibleEntities);
  addEntityRays(rays, visibleEntities);
  rays.sort((a, b) => b.disT - a.disT);
  const drawOptions = { fov, drawMap };
  rays.forEach((_r) => {
    if (_r.isSprite) {
      visibleEntities[_r.index].draw(
        dt2,
        player,
        ctx,
        map_ctx,
        view,
        drawOptions
      );
    } else {
      drawRayWall(
        _r.ray,
        _r.mp,
        _r.disT,
        _r.isVertical,
        _r.isUp,
        _r.isLeft,
        _r.r,
        _r.colorMod
      );
    }
  });
  _rays = rays;
}
function fillSceneBackground() {
  let gradient = ctx.createLinearGradient(0, 0, 0, view.height * 0.75);
  gradient.addColorStop(0, "#555");
  gradient.addColorStop(0.4, "#222");
  gradient.addColorStop(0.5, "#222");
  gradient.addColorStop(0.5, "#555");
  gradient.addColorStop(0.6, "#555");
  gradient.addColorStop(1, "#888");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, view.width, view.height * 0.75);
}
function castSceneRays(entitiesList) {
  const rays = [];
  const columnCount = view.width / horRes;
  const angleStep = fov / view.width * horRes * DR;
  let rayAngle = normalizeAngle(player.a - DR * (fov / 2));
  for (let r = 0; r < columnCount; r++) {
    const rayData = castSceneRay(rayAngle, r);
    const raySegment = {
      x1: rayData.ray.x,
      y1: rayData.ray.y,
      x2: player.x,
      y2: player.y
    };
    entitiesList.forEach((entity) => {
      if (entity.drawn) return;
      const els1 = {
        x1: entity.x - entity.size,
        y1: entity.y - entity.size,
        x2: entity.x + entity.size,
        y2: entity.y + entity.size
      };
      const els2 = {
        x1: entity.x + entity.size,
        y1: entity.y - entity.size,
        x2: entity.x - entity.size,
        y2: entity.y + entity.size
      };
      if (lineIntersect(raySegment, els1) || lineIntersect(raySegment, els2)) {
        if (drawMap) {
          map_ctx.beginPath();
          map_ctx.moveTo(rayData.ray.x, rayData.ray.y);
          map_ctx.lineTo(player.x, player.y);
          map_ctx.strokeStyle = "pink";
          map_ctx.stroke();
        }
        entity.drawn = true;
      }
    });
    if (drawRays && drawMap && rayData.hit) {
      map_ctx.beginPath();
      map_ctx.moveTo(player.x, player.y);
      map_ctx.lineTo(rayData.ray.x, rayData.ray.y);
      map_ctx.strokeStyle = "red";
      map_ctx.lineWidth = 1;
      map_ctx.stroke();
    }
    applyFog(rayData);
    rays.push(rayData);
    rayAngle = normalizeAngle(rayAngle + angleStep);
  }
  return rays;
}
function castSceneRay(angle, column) {
  const horizontalHit = castHorizontalRay(angle);
  const verticalHit = castVerticalRay(angle);
  const useVertical = verticalHit.distance <= horizontalHit.distance;
  const chosen = useVertical ? verticalHit : horizontalHit;
  const hit = chosen.hit;
  const referencePoint = hit ? chosen.point : getFarRayPoint(angle);
  const mapPoint = hit && chosen.map ? { ...chosen.map } : null;
  return {
    ray: { x: referencePoint.x, y: referencePoint.y, a: angle },
    mp: mapPoint,
    disT: hit ? chosen.distance : Infinity,
    isVertical: useVertical,
    isUp: horizontalHit.isUp,
    isLeft: verticalHit.isLeft,
    r: column,
    colorMod: useVertical ? 1 : 0.65,
    hit
  };
}
function castHorizontalRay(angle) {
  let rayX = player.x;
  let rayY = player.y;
  let xo = 0;
  let yo = 0;
  let dof = 0;
  let isUp = false;
  let distance = Infinity;
  let mp = null;
  let hx = player.x;
  let hy = player.y;
  const aTan = -1 / Math.tan(angle);
  if (angle > Math.PI) {
    rayY = Math.floor(player.y / GameMap.size) * GameMap.size - 1e-4;
    rayX = (player.y - rayY) * aTan + player.x;
    yo = -GameMap.size;
    xo = -yo * aTan;
    isUp = true;
  } else if (angle < Math.PI) {
    rayY = Math.floor(player.y / GameMap.size) * GameMap.size + GameMap.size;
    rayX = (player.y - rayY) * aTan + player.x;
    yo = GameMap.size;
    xo = -yo * aTan;
    isUp = false;
  } else {
    dof = DOF;
  }
  while (dof < DOF) {
    const mx = Math.trunc(rayX) >> 6;
    const my = Math.trunc(rayY) >> 6;
    if (mx >= 0 && my >= 0 && mx < map.width && my < map.height && map[my][mx] > 0) {
      hx = rayX;
      hy = rayY;
      distance = dist(player.x, player.y, hx, hy);
      mp = { x: mx, y: my };
      break;
    }
    rayX += xo;
    rayY += yo;
    hx = rayX;
    hy = rayY;
    dof += 1;
  }
  return { hit: mp !== null, distance, point: { x: hx, y: hy }, map: mp, isUp };
}
function castVerticalRay(angle) {
  let rayX = player.x;
  let rayY = player.y;
  let xo = 0;
  let yo = 0;
  let dof = 0;
  let isLeft = false;
  let distance = Infinity;
  let mp = null;
  let vx = player.x;
  let vy = player.y;
  const nTan = -Math.tan(angle);
  if (angle > P2 && angle < P3) {
    rayX = Math.floor(player.x / GameMap.size) * GameMap.size - 1e-4;
    rayY = (player.x - rayX) * nTan + player.y;
    xo = -GameMap.size;
    yo = -xo * nTan;
    isLeft = true;
  } else if (angle < P2 || angle > P3) {
    rayX = Math.floor(player.x / GameMap.size) * GameMap.size + GameMap.size;
    rayY = (player.x - rayX) * nTan + player.y;
    xo = GameMap.size;
    yo = -xo * nTan;
    isLeft = false;
  } else {
    dof = DOF;
  }
  while (dof < DOF) {
    const mx = Math.trunc(rayX) >> 6;
    const my = Math.trunc(rayY) >> 6;
    if (mx >= 0 && my >= 0 && mx < map.width && my < map.height && map[my][mx] > 0) {
      vx = rayX;
      vy = rayY;
      distance = dist(player.x, player.y, vx, vy);
      mp = { x: mx, y: my };
      break;
    }
    rayX += xo;
    rayY += yo;
    vx = rayX;
    vy = rayY;
    dof += 1;
  }
  return {
    hit: mp !== null,
    distance,
    point: { x: vx, y: vy },
    map: mp,
    isLeft
  };
}
function addEntityRays(rays, entitiesList) {
  entitiesList.forEach((entity, index) => {
    if (entity.drawn) {
      rays.push({
        disT: dist(entity.x, entity.y, player.x, player.y),
        isSprite: true,
        index
      });
    }
  });
}
function applyFog(rayData) {
  if (!fogEnabled) return;
  if (rayData.hit && rayData.disT <= FOG.END) return;
  const rayNorm = norm({
    x: rayData.ray.x - player.x,
    y: rayData.ray.y - player.y
  });
  rayData.ray.x = player.x + rayNorm.x * FOG.END;
  rayData.ray.y = player.y + rayNorm.y * FOG.END;
  rayData.disT = FOG.END;
  rayData.mp = null;
  rayData.colorMod = 0;
}
function getFarRayPoint(angle) {
  const direction = { x: Math.cos(angle), y: Math.sin(angle) };
  return {
    x: player.x + direction.x * GameMap.size * DOF,
    y: player.y + direction.y * GameMap.size * DOF
  };
}
var _rays;
function drawRayWall(ray, mp, disT, isVertical, isUp, isLeft, r, colorMod) {
  let ca = player.a - ray.a;
  disT *= Math.cos(ca);
  let lineH = Math.trunc(GameMap.size * view.height * 0.75 / disT);
  let lineO = view.height * 0.75 / 2 - Math.trunc(lineH / 2);
  if (!mp) {
    ctx.beginPath();
    ctx.moveTo(r * horRes + halfHorRes, lineO);
    ctx.lineTo(r * horRes + halfHorRes, lineH + lineO);
    ctx.strokeStyle = "white";
    ctx.lineWidth = horRes;
    ctx.stroke();
    return;
  }
  const x = mp.x;
  const y = mp.y;
  const imgID = map[y][x];
  if (imgID > 0 && walls[imgID]) {
    let percentage = 1;
    if (!isVertical && isUp) {
      percentage = ray.x % GameMap.size / GameMap.size;
    } else if (!isVertical && !isUp) {
      percentage = 1 - ray.x % GameMap.size / GameMap.size;
    } else if (isVertical && !isLeft) {
      percentage = ray.y % GameMap.size / GameMap.size;
    } else if (isVertical && isLeft) {
      percentage = 1 - ray.y % GameMap.size / GameMap.size;
    }
    let pixelX = Math.trunc(walls[imgID].width * percentage);
    ctx.drawImage(
      walls[imgID],
      pixelX,
      0,
      1,
      walls[imgID].height,
      r * horRes,
      lineO,
      horRes,
      lineH
    );
    ctx.globalAlpha = 1 - Math.min(Math.min(lineH, view.height) / view.height + 0.3, 1) * colorMod;
    ctx.fillStyle = "black";
    ctx.fillRect(r * horRes, lineO, horRes, lineH);
    ctx.globalAlpha = 1;
  } else if (imgID > 0) {
    ctx.beginPath();
    ctx.moveTo(r * horRes + halfHorRes, lineO);
    ctx.lineTo(r * horRes + halfHorRes, lineH + lineO);
    ctx.strokeStyle = `rgb(${Math.min(Math.min(lineH, view.height) / view.height + 0.2, 1) * 200 * colorMod},0,0)`;
    ctx.lineWidth = horRes;
    ctx.stroke();
  }
}
function calculateDeltaTime() {
  const now = performance.now();
  const lt = lastTime;
  lastTime = now;
  return (now - lt) / 1e3;
}
function changeQualityHandler(e) {
  updateHorRes(e.target.value);
}
function drawUI() {
  ctx.fillStyle = "green";
  ctx.fillRect(0, view.height * 0.75, view.width, view.height * 0.25);
  ctx.beginPath();
  const crosshairLineWidth = 4;
  const space = 10;
  const width = 15;
  ctx.moveTo(view.width * 0.5, view.halfHeight * 0.75 - space - width);
  ctx.lineTo(view.width * 0.5, view.halfHeight * 0.75 - space);
  ctx.moveTo(view.width * 0.5, view.halfHeight * 0.75 + space + width);
  ctx.lineTo(view.width * 0.5, view.halfHeight * 0.75 + space);
  ctx.moveTo(view.width * 0.5 - space - width, view.halfHeight * 0.75);
  ctx.lineTo(view.width * 0.5 - space, view.halfHeight * 0.75);
  ctx.moveTo(view.width * 0.5 + space + width, view.halfHeight * 0.75);
  ctx.lineTo(view.width * 0.5 + space, view.halfHeight * 0.75);
  ctx.strokeStyle = "green";
  ctx.lineWidth = crosshairLineWidth;
  ctx.stroke();
  ctx.fillStyle = "black";
  const fontSize = 30;
  ctx.font = `${fontSize}px Arial`;
  ctx.fillText(
    "WASD or Arrow Keys to move",
    10,
    view.height * 0.75 + fontSize + 5
  );
  ctx.fillText("SPACE to shoot", 10, view.height * 0.75 + (fontSize + 5) * 2);
  fpsCounterBuffer += dt;
  if (fpsCounterBuffer > 0.25) {
    fpsCounterBuffer = 0;
    fpsLast = Math.trunc(1 / dt);
  }
  ctx.fillText(
    `${fpsLast} fps`,
    10,
    view.height * 0.75 + (fontSize + 5) * 3
  );
}
var fpsCounterBuffer = 0;
var fpsLast = 0;
function toggleMap() {
  drawMap = !drawMap;
  map_c.style.display = drawMap ? "block" : "none";
}
function toggleFog() {
  fogEnabled = !fogEnabled;
}
//# sourceMappingURL=bundle.js.map
