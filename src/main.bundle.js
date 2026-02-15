(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/assets/textures.js
  var walls = [];
  var imgSrcs = [
    "",
    "https://i.imgur.com/7B86fSv.png",
    "https://i.imgur.com/vSDbzMX.png"
  ];
  imgSrcs.forEach((src, i) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    walls[i] = img;
  });

  // src/data/map-matrix.js
  var mapMatrix = [
    [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 6, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 2],
    [1, 2, 2, 2, 2, 2, 4, 2, 2, 2, 2, 2, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ];

  // src/math/geometry.js
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

  // src/map/game-map.js
  var GameMap = class _GameMap extends Array {
    constructor(m) {
      super(...m);
      this.width = this[0].length;
      this.height = this.length;
      this.img = null;
    }
    setTile(x, y, i) {
      this[y][x] = i;
      this.img = null;
    }
    draw(ctx, canvas, { drawMap = false, textures = walls } = {}) {
      if (!drawMap) return;
      if (this.img == null) {
        ctx.fillStyle = "gray";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            const xo = x * _GameMap.size;
            const yo = y * _GameMap.size;
            const i = this[y][x];
            const texture = textures[i];
            if (i > 0 && texture) {
              ctx.drawImage(texture, xo, yo, _GameMap.size, _GameMap.size);
            } else if (i > 0) {
              ctx.fillStyle = "red";
              ctx.fillRect(xo + 1, yo + 1, _GameMap.size - 1, _GameMap.size - 1);
            } else {
              ctx.fillStyle = "black";
              ctx.fillRect(xo + 1, yo + 1, _GameMap.size - 1, _GameMap.size - 1);
            }
          }
        }
        this.img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      } else {
        ctx.putImageData(this.img, 0, 0);
      }
    }
    static get size() {
      return 64;
    }
  };

  // src/entities/entity.js
  var Entity = class {
    constructor(x, y, size, src, frameRate = 0.5) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.drawn = false;
      this.speed = 0.2;
      this.frameIndex = 0;
      this.frameRate = frameRate;
      this.frameTick = 0;
      if (Array.isArray(src)) {
        this.imgs = [];
        this.imgRatios = [];
        for (const srcURL of src) {
          const img = new Image();
          img.onload = () => {
            this.imgRatios.push(img.width / img.height);
          };
          img.crossOrigin = "anonymous";
          img.src = srcURL;
          this.imgs.push(img);
        }
      } else {
        this.img = new Image();
        this.img.onload = () => {
          this.imgRatio = this.img.width / this.img.height;
        };
        this.img.crossOrigin = "anonymous";
        this.img.src = src;
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
    draw(dt, player, ctx, mapCtx, view, { fov = 90, drawMap = false, height = 1, pitchOffset = 0 } = {}) {
      if (!this.imgRatio && this.img) {
        this.imgRatio = this.img.width / this.img.height;
      }
      const disT = dist(player.x, player.y, this.x, this.y);
      const minT = player.a - fov / 2 * (Math.PI / 180);
      const maxT = player.a + fov / 2 * (Math.PI / 180);
      const x = this.x - player.x;
      const y = this.y - player.y;
      let t = Math.atan(y / x);
      if (y < 0 && x > 0) {
        t += Math.PI * 2;
      } else if (y > 0 && x < 0 || y < 0 && x < 0) {
        t += Math.PI;
      }
      const ca = player.a - t;
      const correctedDistance = disT * Math.cos(ca);
      const lineH = Math.trunc(GameMap.size * view.height * height / correctedDistance);
      const lineO = view.halfHeight * 0.75 - Math.trunc(lineH / 2) + pitchOffset;
      if (drawMap) {
        this.drawTracerLine(mapCtx, player);
      }
      const imgRatio = this.img ? this.imgRatio ?? 1 : this.imgRatios[this.frameIndex] ?? 1;
      const width = lineH * imgRatio;
      let percent = (t - minT) / (maxT - minT);
      if (minT < 0 && t > player.a + Math.PI) {
        percent = (t - minT - Math.PI * 2) / (maxT - minT);
      } else if (maxT > Math.PI * 2 && t < player.a - Math.PI) {
        percent = (t - minT + Math.PI * 2) / (maxT - minT);
      }
      const cx = percent * view.width - width / 2;
      if (this.img) {
        ctx.drawImage(this.img, cx, lineO, width, lineH);
      } else if (this.imgs) {
        ctx.drawImage(this.imgs[this.frameIndex], cx, lineO, width, lineH);
        this.frameTick += dt;
        if (this.frameTick > this.frameRate) {
          this.frameTick = 0;
          this.frameIndex += 1;
          if (this.frameIndex >= this.imgs.length) this.frameIndex = 0;
        }
      }
    }
    draw2D(ctx, drawMap = false) {
      if (!drawMap) return;
      ctx.beginPath();
      ctx.moveTo(this.x - this.size, this.y - this.size);
      ctx.lineTo(this.x + this.size, this.y - this.size);
      ctx.lineTo(this.x + this.size, this.y + this.size);
      ctx.lineTo(this.x - this.size, this.y + this.size);
      ctx.lineTo(this.x - this.size, this.y - this.size);
      ctx.strokeStyle = "green";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    update(_player, _normFn, _map) {
    }
    drawTracerLine(mapCtx, player) {
      mapCtx.strokeStyle = "blue";
      mapCtx.lineWidth = 5;
      mapCtx.beginPath();
      mapCtx.moveTo(this.x + this.size, this.y - this.size);
      mapCtx.lineTo(this.x - this.size, this.y + this.size);
      mapCtx.stroke();
      mapCtx.beginPath();
      mapCtx.moveTo(this.x - this.size, this.y - this.size);
      mapCtx.lineTo(this.x + this.size, this.y + this.size);
      mapCtx.stroke();
      mapCtx.beginPath();
      mapCtx.moveTo(player.x, player.y);
      mapCtx.lineTo(this.x, this.y);
      mapCtx.strokeStyle = "green";
      mapCtx.lineWidth = 5;
      mapCtx.stroke();
    }
  };

  // src/entities/enemy.js
  var Enemy = class extends Entity {
    constructor(x, y, size, src) {
      super(x, y, size, src);
    }
    update(player, _normFn, map) {
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
  };

  // src/math/vec2.js
  var Vec2 = class _Vec2 {
    constructor({ x = 0, y = 0 } = {}) {
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
      const mag = _Vec2.dist(this, new _Vec2());
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
      const mag = _Vec2.dist(v, new _Vec2());
      return { x: v.x / mag, y: v.y / mag };
    }
    static dist(v1, v2) {
      return Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2));
    }
    static crossProduct(v1, v2) {
      return v1.x * v2.y - v2.x * v1.y;
    }
  };

  // src/config/constants.js
  var P2 = Math.PI / 2;
  var P3 = 3 * Math.PI / 2;
  var TWO_PI = Math.PI * 2;
  var DR = Math.PI / 180;
  var DOF = 100;
  var DEFAULT_FOV = 90;
  var DEFAULT_HOR_RES = 8;
  var WORLD_HEIGHT_RATIO = 0.75;
  var CROSSHAIR_LINE_WIDTH = 4;
  var CROSSHAIR_SPACE = 10;
  var CROSSHAIR_WIDTH = 15;
  var FPS_UPDATE_INTERVAL = 0.25;
  var FONT_SIZE = 30;
  var DOOR_UNLOCKED_TILE_ID = 3;
  var DOOR_LOCKED_RED_TILE_ID = 4;
  var KEYCARD_RED_TILE_ID = 5;
  var KEY_RED = "red";
  var DOOR_INTERACT_RANGE = 1.5 * 64;
  var DOOR_OPEN_DURATION = 0.35;
  var DOOR_HOLD_DURATION = 2;
  var DOOR_CLOSE_DURATION = 0.5;
  var DOOR_OPEN_PASSABLE_THRESHOLD = 1;
  var LOOK_PITCH_MAX_DEG = 35;
  var LOOK_PITCH_MAX_RAD = LOOK_PITCH_MAX_DEG * Math.PI / 180;
  var LOOK_PITCH_SPEED = 2;

  // src/input/keyboard-state.js
  var _Keyboard = class _Keyboard {
    constructor(logKeystrokes = false) {
      this.keydown = [];
      this.previousKeydown = [];
      this.logKeystrokes = logKeystrokes;
      window.addEventListener("keydown", (e) => {
        if (logKeystrokes) console.log("keydown=" + e.keyCode);
        this.keydown[e.keyCode] = true;
      });
      window.addEventListener("keyup", (e) => {
        if (logKeystrokes) console.log("keyup=" + e.keyCode);
        this.keydown[e.keyCode] = false;
      });
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
    lookPitch() {
      let d = 0;
      if (this.keydown[_Keyboard.KEYBOARD.KEY_R]) {
        d += 1;
      }
      if (this.keydown[_Keyboard.KEYBOARD.KEY_F]) {
        d -= 1;
      }
      return d;
    }
    snapshot() {
      this.previousKeydown = this.keydown.slice();
    }
  };
  __publicField(_Keyboard, "KEYBOARD", {
    KEY_LEFT: 37,
    KEY_UP: 38,
    KEY_RIGHT: 39,
    KEY_DOWN: 40,
    KEY_SPACE: 32,
    KEY_SHIFT: 16,
    KEY_W: 87,
    KEY_S: 83,
    KEY_A: 65,
    KEY_D: 68,
    KEY_E: 69,
    KEY_R: 82,
    KEY_F: 70
  });
  var Keyboard = _Keyboard;

  // src/entities/bullet.js
  var Bullet = class extends Entity {
    constructor(x, y, direction, size, src) {
      const dir = direction && (direction.x !== 0 || direction.y !== 0) ? norm(direction) : { x: Math.cos(0), y: Math.sin(0) };
      super(x + dir.x * 20, y + dir.y * 20, size, src);
      this.speed = 5;
      this.direction = dir;
      this.isAlive = true;
    }
    update(_player, _normFn, map) {
      this.x += this.direction.x * this.speed;
      this.y += this.direction.y * this.speed;
      const newX = Math.trunc(this.x) >> 6;
      const newY = Math.trunc(this.y) >> 6;
      if (newY < 0 || newY >= map.length || newX < 0 || newX >= map[0].length || map[newY][newX] > 0) {
        this.isAlive = false;
      }
    }
    draw(dt, player, ctx, mapCtx, view, options = {}) {
      super.draw(dt, player, ctx, mapCtx, view, {
        ...options,
        height: 0.4
      });
    }
  };

  // src/entities/player.js
  var Player = class {
    constructor(x = 0, y = 0, a = 0, speed = 200, lookSpeed = 2) {
      this.pos = new Vec2({ x, y });
      this.a = a;
      this.pitch = 0;
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
    update(dt, kb, map, spawnBullet) {
      this.turn(dt, kb);
      this.look(dt, kb);
      this.move(dt, kb, map);
      this.shoot(kb, spawnBullet);
    }
    turn(dt, kb) {
      const d = kb.turn();
      if (!d) return;
      this.a += this.lookSpeed * dt * d;
      if (this.a > Math.PI * 2) this.a -= Math.PI * 2;
      if (this.a < 0) this.a += Math.PI * 2;
    }
    look(dt, kb) {
      const d = kb.lookPitch();
      if (!d) return;
      this.pitch += d * LOOK_PITCH_SPEED * dt;
      if (this.pitch > LOOK_PITCH_MAX_RAD) this.pitch = LOOK_PITCH_MAX_RAD;
      if (this.pitch < -LOOK_PITCH_MAX_RAD) this.pitch = -LOOK_PITCH_MAX_RAD;
    }
    move(dt, kb, map) {
      const mapHeight = map.length;
      const mapWidth = map[0]?.length ?? 0;
      const tileAt = (tileX, tileY) => {
        if (tileY < 0 || tileY >= mapHeight || tileX < 0 || tileX >= mapWidth) {
          return 1;
        }
        return map[tileY][tileX];
      };
      const d = kb.move();
      this.dx = Math.cos(this.a) * this.speed * dt;
      this.dy = Math.sin(this.a) * this.speed * dt;
      if (!d) return;
      const oldX = Math.trunc(this.x) >> 6;
      const oldY = Math.trunc(this.y) >> 6;
      const newX = Math.trunc(this.x + this.dx * d) >> 6;
      const newY = Math.trunc(this.y + this.dy * d) >> 6;
      if (!tileAt(newX, newY) || newX === oldX || newY !== oldY && !tileAt(newX, oldY)) {
        this.x += this.dx * d;
      }
      if (!tileAt(newX, newY) || newY === oldY || newX !== oldX && !tileAt(oldX, newY)) {
        this.y += this.dy * d;
      }
    }
    shoot(kb, spawnBullet) {
      if (!spawnBullet) return;
      if (kb.keydown[Keyboard.KEYBOARD.KEY_SPACE] && !kb.previousKeydown[Keyboard.KEYBOARD.KEY_SPACE]) {
        const direction = norm({ x: Math.cos(this.a), y: Math.sin(this.a) });
        spawnBullet(new Bullet(this.x, this.y, direction, 5, "https://i.imgur.com/xrYTZhD.png"));
      }
    }
    draw2D(ctx, drawMap = false) {
      if (!drawMap) return;
      ctx.fillStyle = "yellow";
      ctx.fillRect(this.x - 10, this.y - 10, 20, 20);
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(this.x + this.dx * 20, this.y + this.dy * 20);
      ctx.strokeStyle = "yellow";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  };

  // src/systems/raycast-system.js
  function isIgnoredTile(ignoreTile, tileX, tileY) {
    return ignoreTile && ignoreTile.x === tileX && ignoreTile.y === tileY;
  }
  function normalizeAngle(angle) {
    angle %= TWO_PI;
    return angle < 0 ? angle + TWO_PI : angle;
  }
  function castSceneRays(state, entitiesList) {
    const rays = [];
    const columnCount = state.view.width / state.horRes;
    const angleStep = state.fov / state.view.width * state.horRes * DR;
    let rayAngle = normalizeAngle(state.player.a - DR * (state.fov / 2));
    for (let r = 0; r < columnCount; r++) {
      const rayData = castSceneRay(state, rayAngle, r);
      const raySegment = {
        x1: rayData.ray.x,
        y1: rayData.ray.y,
        x2: state.player.x,
        y2: state.player.y
      };
      entitiesList.forEach((entity) => {
        if (entity.drawn) return;
        const diag1 = {
          x1: entity.x - entity.size,
          y1: entity.y - entity.size,
          x2: entity.x + entity.size,
          y2: entity.y + entity.size
        };
        const diag2 = {
          x1: entity.x + entity.size,
          y1: entity.y - entity.size,
          x2: entity.x - entity.size,
          y2: entity.y + entity.size
        };
        if (lineIntersect(raySegment, diag1) || lineIntersect(raySegment, diag2)) {
          if (state.drawMap) {
            state.mapCtx.beginPath();
            state.mapCtx.moveTo(rayData.ray.x, rayData.ray.y);
            state.mapCtx.lineTo(state.player.x, state.player.y);
            state.mapCtx.strokeStyle = "pink";
            state.mapCtx.stroke();
          }
          entity.drawn = true;
        }
      });
      if (state.drawRays && state.drawMap && rayData.hit) {
        state.mapCtx.beginPath();
        state.mapCtx.moveTo(state.player.x, state.player.y);
        state.mapCtx.lineTo(rayData.ray.x, rayData.ray.y);
        state.mapCtx.strokeStyle = "red";
        state.mapCtx.lineWidth = 1;
        state.mapCtx.stroke();
      }
      applyFog(state, rayData);
      rays.push(rayData);
      rayAngle = normalizeAngle(rayAngle + angleStep);
    }
    return rays;
  }
  function castSceneRay(state, angle, column, ignoreTile = null) {
    const horizontalHit = castHorizontalRay(state, angle, ignoreTile);
    const verticalHit = castVerticalRay(state, angle, ignoreTile);
    const useVertical = verticalHit.distance <= horizontalHit.distance;
    const chosen = useVertical ? verticalHit : horizontalHit;
    const hit = chosen.hit;
    const referencePoint = hit ? chosen.point : getFarRayPoint(state, angle);
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
  function castHorizontalRay(state, angle, ignoreTile = null) {
    const map = state.map;
    const player = state.player;
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
        if (isIgnoredTile(ignoreTile, mx, my)) {
          rayX += xo;
          rayY += yo;
          hx = rayX;
          hy = rayY;
          dof += 1;
          continue;
        }
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
  function castVerticalRay(state, angle, ignoreTile = null) {
    const map = state.map;
    const player = state.player;
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
        if (isIgnoredTile(ignoreTile, mx, my)) {
          rayX += xo;
          rayY += yo;
          vx = rayX;
          vy = rayY;
          dof += 1;
          continue;
        }
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
  function applyFog(state, rayData) {
    if (!state.fogEnabled) return;
    if (rayData.hit && rayData.disT <= state.fog.END) return;
    const rayNorm = norm({
      x: rayData.ray.x - state.player.x,
      y: rayData.ray.y - state.player.y
    });
    rayData.ray.x = state.player.x + rayNorm.x * state.fog.END;
    rayData.ray.y = state.player.y + rayNorm.y * state.fog.END;
    rayData.disT = state.fog.END;
    rayData.mp = null;
    rayData.colorMod = 0;
  }
  function getFarRayPoint(state, angle) {
    const direction = { x: Math.cos(angle), y: Math.sin(angle) };
    return {
      x: state.player.x + direction.x * GameMap.size * DOF,
      y: state.player.y + direction.y * GameMap.size * DOF
    };
  }

  // src/render/background-renderer.js
  function fillSceneBackground(state) {
    const worldHeight = state.view.height * WORLD_HEIGHT_RATIO;
    const pitchOffsetPx = Math.tan(state.player.pitch) * (worldHeight * 0.5);
    const unclampedHorizonY = worldHeight * 0.5 + pitchOffsetPx;
    const horizonY = Math.max(0, Math.min(worldHeight, unclampedHorizonY));
    if (horizonY > 0) {
      const skyGradient = state.ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGradient.addColorStop(0, "#666");
      skyGradient.addColorStop(1, "#222");
      state.ctx.fillStyle = skyGradient;
      state.ctx.fillRect(0, 0, state.view.width, horizonY);
    }
    if (horizonY < worldHeight) {
      const floorGradient = state.ctx.createLinearGradient(0, horizonY, 0, worldHeight);
      floorGradient.addColorStop(0, "#555");
      floorGradient.addColorStop(1, "#888");
      state.ctx.fillStyle = floorGradient;
      state.ctx.fillRect(0, horizonY, state.view.width, worldHeight - horizonY);
    }
  }

  // src/render/wall-renderer.js
  var DOOR_OPEN_EPSILON = 1e-4;
  function getWallSamplePercent(ray, isVertical, isUp, isLeft) {
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
    if (percentage < 0) return 0;
    if (percentage > 0.9999) return 0.9999;
    return percentage;
  }
  function drawBehindDoorRay(state, rayData) {
    const behindRayData = castSceneRay(state, rayData.ray.a, rayData.r, rayData.mp);
    applyFog(state, behindRayData);
    drawRayWall(state, behindRayData);
  }
  function drawRayWall(state, rayData) {
    const { ray, mp, isVertical, isUp, isLeft, r, colorMod } = rayData;
    const ctx = state.ctx;
    const worldHeight = state.view.height * WORLD_HEIGHT_RATIO;
    const pitchOffsetPx = Math.tan(state.player.pitch) * (worldHeight * 0.5);
    let disT = rayData.disT;
    const ca = state.player.a - ray.a;
    disT *= Math.cos(ca);
    const lineH = Math.trunc(GameMap.size * worldHeight / disT);
    const lineO = worldHeight / 2 - Math.trunc(lineH / 2) + pitchOffsetPx;
    if (!mp) {
      ctx.beginPath();
      ctx.moveTo(r * state.horRes + state.halfHorRes, lineO);
      ctx.lineTo(r * state.horRes + state.halfHorRes, lineH + lineO);
      ctx.strokeStyle = "white";
      ctx.lineWidth = state.horRes;
      ctx.stroke();
      return;
    }
    const x = mp.x;
    const y = mp.y;
    const imgID = state.map[y][x];
    const percentage = getWallSamplePercent(ray, isVertical, isUp, isLeft);
    const door = state.doors?.[`${x},${y}`];
    if (door && door.openAmount > DOOR_OPEN_EPSILON && percentage < door.openAmount) {
      drawBehindDoorRay(state, rayData);
      return;
    }
    if (imgID > 0 && state.walls[imgID]) {
      const pixelX = Math.trunc(state.walls[imgID].width * percentage);
      ctx.drawImage(
        state.walls[imgID],
        pixelX,
        0,
        1,
        state.walls[imgID].height,
        r * state.horRes,
        lineO,
        state.horRes,
        lineH
      );
      ctx.globalAlpha = 1 - Math.min(Math.min(lineH, state.view.height) / state.view.height + 0.3, 1) * colorMod;
      ctx.fillStyle = "black";
      ctx.fillRect(r * state.horRes, lineO, state.horRes, lineH);
      ctx.globalAlpha = 1;
    } else if (imgID > 0) {
      ctx.beginPath();
      ctx.moveTo(r * state.horRes + state.halfHorRes, lineO);
      ctx.lineTo(r * state.horRes + state.halfHorRes, lineH + lineO);
      ctx.strokeStyle = `rgb(${Math.min(Math.min(lineH, state.view.height) / state.view.height + 0.2, 1) * 200 * colorMod},0,0)`;
      ctx.lineWidth = state.horRes;
      ctx.stroke();
    }
  }

  // src/render/entity-renderer.js
  function addEntityRays(state, rays, entitiesList) {
    entitiesList.forEach((entity, index) => {
      if (entity.drawn) {
        rays.push({
          disT: dist(entity.x, entity.y, state.player.x, state.player.y),
          isSprite: true,
          index
        });
      }
    });
  }
  function drawEntities2D(state) {
    state.entityStore.getEntities().forEach((entity) => entity.draw2D(state.mapCtx, state.drawMap));
  }
  function drawRaycastScene(state) {
    fillSceneBackground(state);
    const visibleEntities = state.entityStore.getEntities();
    visibleEntities.forEach((entity) => {
      entity.drawn = false;
    });
    const rays = castSceneRays(state, visibleEntities);
    addEntityRays(state, rays, visibleEntities);
    rays.sort((a, b) => b.disT - a.disT);
    const worldHeight = state.view.height * WORLD_HEIGHT_RATIO;
    const pitchOffset = Math.tan(state.player.pitch) * (worldHeight * 0.5);
    const drawOptions = { fov: state.fov, drawMap: state.drawMap, pitchOffset };
    rays.forEach((rayEntry) => {
      if (rayEntry.isSprite) {
        visibleEntities[rayEntry.index].draw(
          state.dt,
          state.player,
          state.ctx,
          state.mapCtx,
          state.view,
          drawOptions
        );
      } else {
        drawRayWall(state, rayEntry);
      }
    });
    state.rays = rays;
  }

  // src/render/ui-renderer.js
  function drawUI(state) {
    const uiTop = state.view.height * WORLD_HEIGHT_RATIO;
    const hudFontSize = Math.min(FONT_SIZE, 20);
    const hudLineStep = hudFontSize + 4;
    state.ctx.fillStyle = "green";
    state.ctx.fillRect(0, uiTop, state.view.width, state.view.height * 0.25);
    state.ctx.beginPath();
    state.ctx.moveTo(state.view.width * 0.5, state.view.halfHeight * WORLD_HEIGHT_RATIO - CROSSHAIR_SPACE - CROSSHAIR_WIDTH);
    state.ctx.lineTo(state.view.width * 0.5, state.view.halfHeight * WORLD_HEIGHT_RATIO - CROSSHAIR_SPACE);
    state.ctx.moveTo(state.view.width * 0.5, state.view.halfHeight * WORLD_HEIGHT_RATIO + CROSSHAIR_SPACE + CROSSHAIR_WIDTH);
    state.ctx.lineTo(state.view.width * 0.5, state.view.halfHeight * WORLD_HEIGHT_RATIO + CROSSHAIR_SPACE);
    state.ctx.moveTo(state.view.width * 0.5 - CROSSHAIR_SPACE - CROSSHAIR_WIDTH, state.view.halfHeight * WORLD_HEIGHT_RATIO);
    state.ctx.lineTo(state.view.width * 0.5 - CROSSHAIR_SPACE, state.view.halfHeight * WORLD_HEIGHT_RATIO);
    state.ctx.moveTo(state.view.width * 0.5 + CROSSHAIR_SPACE + CROSSHAIR_WIDTH, state.view.halfHeight * WORLD_HEIGHT_RATIO);
    state.ctx.lineTo(state.view.width * 0.5 + CROSSHAIR_SPACE, state.view.halfHeight * WORLD_HEIGHT_RATIO);
    state.ctx.strokeStyle = "green";
    state.ctx.lineWidth = CROSSHAIR_LINE_WIDTH;
    state.ctx.stroke();
    state.ctx.fillStyle = "black";
    state.ctx.font = `${hudFontSize}px Arial`;
    state.ctx.fillText("WASD or Arrow Keys to move", 10, uiTop + hudLineStep * 1);
    state.ctx.fillText("SPACE to shoot", 10, uiTop + hudLineStep * 2);
    state.ctx.fillText("E to open/close doors", 10, uiTop + hudLineStep * 3);
    state.ctx.fillText("R/F to look up/down", 10, uiTop + hudLineStep * 4);
    state.ctx.fillText(
      `Red keycard: ${state.inventory.hasRedKeycard ? "YES" : "NO"}`,
      10,
      uiTop + hudLineStep * 5
    );
    if (state.uiNotice.timer > 0 && state.uiNotice.text) {
      state.ctx.fillStyle = "#aa0000";
      state.ctx.fillText(state.uiNotice.text, state.view.width * 0.45, uiTop + hudLineStep * 1);
      state.ctx.fillStyle = "black";
    }
    state.fpsCounterBuffer += state.dt;
    if (state.fpsCounterBuffer > FPS_UPDATE_INTERVAL) {
      state.fpsCounterBuffer = 0;
      state.fpsLast = Math.trunc(1 / state.dt);
    }
    state.ctx.fillText(`${state.fpsLast} fps`, 10, uiTop + hudLineStep * 6);
  }

  // src/state/game-state.js
  function createGameState({ viewCanvas, mapCanvas, ctx, mapCtx, map, player, keyboard, walls: walls2 }) {
    const entityStore = {
      bullets: [],
      enemies: [],
      pickups: [],
      getEntities() {
        return this.enemies.concat(this.bullets, this.pickups);
      }
    };
    return {
      canvases: {
        view: viewCanvas,
        map: mapCanvas
      },
      ctx,
      mapCtx,
      map,
      player,
      keyboard,
      walls: walls2,
      entityStore,
      doors: {},
      inventory: {
        hasRedKeycard: false
      },
      uiNotice: {
        text: "",
        timer: 0
      },
      drawMap: false,
      fogEnabled: false,
      drawRays: true,
      fov: DEFAULT_FOV,
      horRes: DEFAULT_HOR_RES,
      halfHorRes: DEFAULT_HOR_RES / 2,
      lastTime: 0,
      dt: 0,
      rays: [],
      fpsCounterBuffer: 0,
      fpsLast: 0,
      fog: {
        START: 3 * GameMap.size,
        END: 9 * GameMap.size
      },
      view: {
        get width() {
          return viewCanvas.width;
        },
        get height() {
          return viewCanvas.height;
        },
        get halfHeight() {
          return viewCanvas.height / 2;
        }
      }
    };
  }

  // src/systems/collision-system.js
  function resolveBulletCollisions(state) {
    const { bullets, enemies } = state.entityStore;
    const map = state.map;
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

  // src/systems/bullet-system.js
  function updateBullets(state) {
    state.entityStore.bullets.forEach((bullet) => bullet.update(state.player, norm, state.map));
  }

  // src/systems/enemy-system.js
  function updateEnemies(state) {
    state.entityStore.enemies.forEach((enemy) => enemy.update(state.player, norm, state.map));
  }

  // src/systems/frame-loop.js
  function calculateDeltaTime(state) {
    const now = performance.now();
    const lastTime = state.lastTime;
    state.lastTime = now;
    return (now - lastTime) / 1e3;
  }
  function startFrameLoop(state, frameFn) {
    function frame() {
      state.dt = calculateDeltaTime(state);
      frameFn(state);
      state.keyboard.snapshot();
      requestAnimationFrame(frame);
    }
    frame();
  }

  // src/entities/pickup.js
  var Pickup = class extends Entity {
    constructor(x, y, size, src, pickupType) {
      super(x, y, size, src);
      this.pickupType = pickupType;
      this.collected = false;
    }
    draw(dt, player, ctx, mapCtx, view, options = {}) {
      super.draw(dt, player, ctx, mapCtx, view, {
        ...options,
        height: 0.45
      });
    }
    draw2D(ctx, drawMap = false) {
      if (!drawMap || this.collected) return;
      ctx.fillStyle = "#ff4444";
      ctx.fillRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1;
      ctx.strokeRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
    }
  };

  // src/systems/keycard-system.js
  var PICKUP_RADIUS = GameMap.size * 0.35;
  var PICKUP_RADIUS_SQ = PICKUP_RADIUS * PICKUP_RADIUS;
  var DEFAULT_NOTICE_DURATION = 1.25;
  var RED_KEYCARD_SPRITE = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40">
    <rect x="1" y="1" width="62" height="38" rx="6" fill="#b61212" stroke="#ffe1e1" stroke-width="2"/>
    <rect x="9" y="9" width="22" height="8" rx="2" fill="#ffe1e1"/>
    <circle cx="49" cy="20" r="6" fill="#ffe1e1"/>
    <rect x="41" y="28" width="16" height="4" rx="2" fill="#ffe1e1"/>
  </svg>`
  )}`;
  function clearNotice(state) {
    state.uiNotice.text = "";
    state.uiNotice.timer = 0;
  }
  function updateNoticeTimer(state) {
    if (state.uiNotice.timer <= 0) return;
    state.uiNotice.timer -= state.dt;
    if (state.uiNotice.timer <= 0) {
      clearNotice(state);
    }
  }
  function setUiNotice(state, text, duration = DEFAULT_NOTICE_DURATION) {
    state.uiNotice.text = text;
    state.uiNotice.timer = duration;
  }
  function collectPickup(state, pickup) {
    if (pickup.collected) return;
    pickup.collected = true;
    if (pickup.pickupType === KEY_RED && !state.inventory.hasRedKeycard) {
      state.inventory.hasRedKeycard = true;
      setUiNotice(state, "Picked up red keycard", 1.5);
    }
  }
  function initializeKeycardsFromMap(state) {
    for (let y = 0; y < state.map.height; y++) {
      for (let x = 0; x < state.map.width; x++) {
        if (state.map[y][x] !== KEYCARD_RED_TILE_ID) continue;
        const centerX = x * GameMap.size + GameMap.size * 0.5;
        const centerY = y * GameMap.size + GameMap.size * 0.5;
        state.entityStore.pickups.push(new Pickup(centerX, centerY, 10, RED_KEYCARD_SPRITE, KEY_RED));
        state.map.setTile(x, y, 0);
      }
    }
  }
  function updateKeycardPickups(state) {
    updateNoticeTimer(state);
    for (let i = state.entityStore.pickups.length - 1; i >= 0; i--) {
      const pickup = state.entityStore.pickups[i];
      if (pickup.collected) {
        state.entityStore.pickups.splice(i, 1);
        continue;
      }
      const dx = pickup.x - state.player.x;
      const dy = pickup.y - state.player.y;
      if (dx * dx + dy * dy <= PICKUP_RADIUS_SQ) {
        collectPickup(state, pickup);
        state.entityStore.pickups.splice(i, 1);
      }
    }
  }

  // src/systems/door-system.js
  var DOOR_CLOSE_RETRY_DELAY = 0.15;
  var EPSILON = 1e-6;
  function getDoorKey(tileX, tileY) {
    return `${tileX},${tileY}`;
  }
  function worldToTile(value) {
    return Math.trunc(value) >> 6;
  }
  function setDoorPhase(door, phase) {
    door.phase = phase;
  }
  function isDoorTile(tile) {
    return tile === DOOR_UNLOCKED_TILE_ID || tile === DOOR_LOCKED_RED_TILE_ID;
  }
  function getClosedDoorTile(door) {
    return door.locked ? DOOR_LOCKED_RED_TILE_ID : DOOR_UNLOCKED_TILE_ID;
  }
  function hasRequiredKey(state, door) {
    if (!door.requiredKey) return true;
    if (door.requiredKey === KEY_RED) return state.inventory.hasRedKeycard;
    return false;
  }
  function tryUnlockDoor(state, door) {
    if (!door.locked) return true;
    if (!hasRequiredKey(state, door)) {
      if (door.requiredKey === KEY_RED) {
        setUiNotice(state, "Red keycard required");
      }
      return false;
    }
    door.locked = false;
    door.requiredKey = null;
    ensureDoorTile(state, door, DOOR_UNLOCKED_TILE_ID);
    return true;
  }
  function ensureDoorTile(state, door, tileValue) {
    if (state.map[door.tileY][door.tileX] !== tileValue) {
      state.map.setTile(door.tileX, door.tileY, tileValue);
    }
  }
  function isDoorBlockedByActors(state, door) {
    const px = worldToTile(state.player.x);
    const py = worldToTile(state.player.y);
    if (px === door.tileX && py === door.tileY) {
      return true;
    }
    return state.entityStore.enemies.some((enemy) => {
      const ex = worldToTile(enemy.x);
      const ey = worldToTile(enemy.y);
      return ex === door.tileX && ey === door.tileY;
    });
  }
  function getClosestDoorInFront(state) {
    const direction = { x: Math.cos(state.player.a), y: Math.sin(state.player.a) };
    const steps = 12;
    const stepDistance = DOOR_INTERACT_RANGE / steps;
    let closestDoor = null;
    let closestDistance = Infinity;
    for (let i = 1; i <= steps; i++) {
      const sampleX = state.player.x + direction.x * stepDistance * i;
      const sampleY = state.player.y + direction.y * stepDistance * i;
      const tileX = worldToTile(sampleX);
      const tileY = worldToTile(sampleY);
      if (tileY < 0 || tileY >= state.map.height || tileX < 0 || tileX >= state.map.width) {
        break;
      }
      const sampledTile = state.map[tileY][tileX];
      if (sampledTile > 0 && !isDoorTile(sampledTile)) {
        break;
      }
      const key = getDoorKey(tileX, tileY);
      const door = state.doors[key];
      if (!door) continue;
      const centerX = tileX * GameMap.size + GameMap.size * 0.5;
      const centerY = tileY * GameMap.size + GameMap.size * 0.5;
      const dx = centerX - state.player.x;
      const dy = centerY - state.player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > DOOR_INTERACT_RANGE) continue;
      if (distance < closestDistance) {
        closestDoor = door;
        closestDistance = distance;
      }
    }
    return closestDoor;
  }
  function activateDoor(state, door) {
    if (!tryUnlockDoor(state, door)) return;
    if (door.phase === "opening") return;
    if (door.phase === "closing") {
      setDoorPhase(door, "opening");
      ensureDoorTile(state, door, 0);
      return;
    }
    if (door.phase === "open") {
      door.holdTimer = DOOR_HOLD_DURATION;
      return;
    }
    setDoorPhase(door, "opening");
  }
  function updateDoorOpening(state, door) {
    door.openAmount = Math.min(door.openAmount + state.dt / DOOR_OPEN_DURATION, 1);
    if (door.openAmount < DOOR_OPEN_PASSABLE_THRESHOLD - EPSILON) {
      return;
    }
    ensureDoorTile(state, door, 0);
    door.openAmount = 1;
    door.holdTimer = DOOR_HOLD_DURATION;
    setDoorPhase(door, "open");
  }
  function updateDoorOpen(state, door) {
    ensureDoorTile(state, door, 0);
    door.holdTimer -= state.dt;
    if (door.holdTimer > 0) return;
    if (isDoorBlockedByActors(state, door)) {
      door.holdTimer = DOOR_CLOSE_RETRY_DELAY;
      return;
    }
    ensureDoorTile(state, door, getClosedDoorTile(door));
    setDoorPhase(door, "closing");
  }
  function updateDoorClosing(state, door) {
    ensureDoorTile(state, door, getClosedDoorTile(door));
    if (isDoorBlockedByActors(state, door)) {
      ensureDoorTile(state, door, 0);
      setDoorPhase(door, "opening");
      return;
    }
    door.openAmount = Math.max(door.openAmount - state.dt / DOOR_CLOSE_DURATION, 0);
    if (door.openAmount > EPSILON) {
      return;
    }
    door.openAmount = 0;
    setDoorPhase(door, "closed");
  }
  function initializeDoorsFromMap(state) {
    const doors = {};
    for (let y = 0; y < state.map.height; y++) {
      for (let x = 0; x < state.map.width; x++) {
        const tile = state.map[y][x];
        if (!isDoorTile(tile)) continue;
        const key = getDoorKey(x, y);
        doors[key] = {
          tileX: x,
          tileY: y,
          locked: tile === DOOR_LOCKED_RED_TILE_ID,
          requiredKey: tile === DOOR_LOCKED_RED_TILE_ID ? KEY_RED : null,
          phase: "closed",
          openAmount: 0,
          holdTimer: 0
        };
      }
    }
    state.doors = doors;
  }
  function handleDoorActivation(state) {
    const eDown = state.keyboard.keydown[Keyboard.KEYBOARD.KEY_E];
    const eWasDown = state.keyboard.previousKeydown[Keyboard.KEYBOARD.KEY_E];
    if (!eDown || eWasDown) return;
    const targetDoor = getClosestDoorInFront(state);
    if (!targetDoor) return;
    activateDoor(state, targetDoor);
  }
  function updateDoors(state) {
    Object.values(state.doors).forEach((door) => {
      if (door.phase === "opening") {
        updateDoorOpening(state, door);
        return;
      }
      if (door.phase === "open") {
        updateDoorOpen(state, door);
        return;
      }
      if (door.phase === "closing") {
        updateDoorClosing(state, door);
        return;
      }
      ensureDoorTile(state, door, getClosedDoorTile(door));
    });
  }

  // src/systems/player-system.js
  function updatePlayer(state) {
    state.player.update(state.dt, state.keyboard, state.map, (bullet) => {
      state.entityStore.bullets.push(bullet);
    });
  }

  // src/ui/controls.js
  function setHorizontalResolution(state, value) {
    state.horRes = Number(value);
    state.halfHorRes = state.horRes / 2;
  }
  function toggleMap(state) {
    state.drawMap = !state.drawMap;
    state.canvases.map.style.display = state.drawMap ? "block" : "none";
  }
  function toggleFog(state) {
    state.fogEnabled = !state.fogEnabled;
  }
  function bindControls(state, root = document) {
    root.querySelectorAll('input[type="radio"][name="quality"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        setHorizontalResolution(state, e.target.value);
      });
    });
    const mapButton = root.getElementById("toggle-map");
    if (mapButton) {
      mapButton.addEventListener("click", () => toggleMap(state));
    }
    const fogButton = root.getElementById("toggle-fog");
    if (fogButton) {
      fogButton.addEventListener("click", () => toggleFog(state));
    }
    setHorizontalResolution(state, DEFAULT_HOR_RES);
  }

  // src/main.js
  window.addEventListener("load", init);
  function init() {
    const viewCanvas = document.getElementById("view");
    const mapCanvas = document.getElementById("map");
    const ctx = viewCanvas.getContext("2d");
    const mapCtx = mapCanvas.getContext("2d");
    const map = new GameMap(mapMatrix);
    const keyboard = new Keyboard();
    const player = new Player(300, 300);
    const state = createGameState({
      viewCanvas,
      mapCanvas,
      ctx,
      mapCtx,
      map,
      player,
      keyboard,
      walls
    });
    setupCanvas(state);
    initializeDoorsFromMap(state);
    initializeKeycardsFromMap(state);
    seedEntities(state);
    bindControls(state);
    startFrameLoop(state, (frameState) => {
      updateFrame(frameState);
      drawFrame(frameState);
    });
  }
  function setupCanvas(state) {
    state.canvases.map.width = state.map[0].length * GameMap.size;
    state.canvases.map.height = state.map.length * GameMap.size;
    state.mapCtx.imageSmoothingEnabled = false;
    state.ctx.imageSmoothingEnabled = false;
  }
  function seedEntities(state) {
    const { enemies } = state.entityStore;
    enemies.push(new Enemy(600, 450, 10, "https://i.imgur.com/FcIXhVp.png"));
    enemies.push(
      new Enemy(200, 700, 10, [
        "https://i.imgur.com/rAFkpSc.png",
        "https://i.imgur.com/rYCrqax.png",
        "https://i.imgur.com/p5w5cCU.png"
      ])
    );
    enemies.push(new Entity(600, 750, 40, "https://i.imgur.com/rgwwS0K.png"));
  }
  function updateFrame(state) {
    updatePlayer(state);
    updateKeycardPickups(state);
    handleDoorActivation(state);
    updateDoors(state);
    updateEnemies(state);
    updateBullets(state);
    resolveBulletCollisions(state);
  }
  function drawFrame(state) {
    state.map.draw(state.mapCtx, state.canvases.map, {
      drawMap: state.drawMap,
      textures: state.walls
    });
    drawRaycastScene(state);
    state.player.draw2D(state.mapCtx, state.drawMap);
    drawEntities2D(state);
    drawUI(state);
  }
})();
