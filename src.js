"use strict";

window.onload = init;

//game
let lastTime = 0; // used by calculateDeltaTime()
let dt = 0;

// let entities = [];
let bullets = [];
let enemies = [];
enemies.push(new Enemy(600, 450, 10, "https://i.imgur.com/FcIXhVp.png"));
enemies.push(
  new Enemy(200, 700, 10, [
    "https://i.imgur.com/rAFkpSc.png",
    "https://i.imgur.com/rYCrqax.png",
    "https://i.imgur.com/p5w5cCU.png",
  ])
);
enemies.push(new Entity(600, 750, 40, "https://i.imgur.com/rgwwS0K.png"));

//#region canvas
const c = document.getElementById("view");
const ctx = c.getContext("2d");
const map_c = document.getElementById("map");
const map_ctx = map_c.getContext("2d");
//const UI_OFFSET;
let drawMap = false;
//#endregion

//#region constants
const P2 = Math.PI / 2;
const P3 = (3 * Math.PI) / 2;
const DR = Math.PI / 180; // one degree in radians
const RD = 180 / Math.PI; // on radian in degrees
const DOF = 64;
//#endregion

//#region view
const view = {
  _halfHeight: c.height / 2,
  get width() {
    return c.width;
  },
  get height() {
    return c.height;
  },
  get halfHeight() {
    return this._halfHeight;
  },
};
let fov = 80;
let horRes = 8; //horizontal resolution, higher number = less resolution
let halfHorRes = horRes / 2;
let drawRays = true;
function updateHorRes(num) {
  horRes = num;
  halfHorRes = horRes / 2;
}
//#endregion

//#region wall texture stuff
const walls = [];
const imgSrcs = [
  "",
  "https://i.imgur.com/7B86fSv.png",
  "https://i.imgur.com/vSDbzMX.png",
];
imgSrcs.forEach((src, i) => {
  walls[i] = new Image();
  walls[i].src = src;
  walls[i].setAttribute("crossOrigin", "");
});
//#endregion

let _m = [
  [1, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1],
  [1, 0, 2, 0, 0, 2, 1, 0, 0, 0, 2],
  [1, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 2],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [1, 0, 2, 0, 0, 3, 1, 0, 0, 0, 2],
  [1, 0, 2, 0, 0, 0, 1, 0, 0, 0, 2],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const map = new Map(_m);

const myKeys = new Keyboard();

const player = new Player(300, 300);

function init() {
  //hook up quality buttons
  document
    .querySelectorAll('input[type=radio][name="quality"]')
    .forEach((r) => {
      r.addEventListener("change", changeQualityHandler);
    });
  updateHorRes(8);

  map_c.width = map[0].length * Map.size;
  map_c.height = map.length * Map.size;
  map_ctx.imageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;
  update();
}

function update() {
  dt = calculateDeltaTime();
  player.update(dt, myKeys, map);
  updateEntites();
  draw(dt);
  requestAnimationFrame(update);
  myKeys.previousKeydown = myKeys.keydown.slice();
}

function draw(dt) {
  map.draw(map_ctx, map_c);
  drawRays2D(dt);
  player.draw(map_ctx);
  drawEntites();
  drawUI();
}

function entities() {
  return enemies.concat(bullets);
}

function updateEntites() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    let bullet = bullets[i];
    for (let j = enemies.length - 1; j >= 0; j--) {
      let enemy = enemies[j];
      if (pointInsideAABB(bullet.point, enemy.min, enemy.max)) {
        bullets.splice(i, 1);
        enemies.splice(j, 1);
      }
    }
  }
  entities().forEach((e) => e.update(player, norm));
}

function drawEntites() {
  entities().forEach((e) => e.draw2D(map_ctx));
}

function drawRays2D(dt) {
  ctx.fillStyle = "#333";
  //ctx.fillRect(0,0,view.width,view.halfHeight);
  ctx.fillRect(0, 0, view.width, 225);
  ctx.fillStyle = "gray";
  //ctx.fillRect(0,view.halfHeight,view.width,view.halfHeight);
  ctx.fillRect(0, 225, view.width, 225);

  let colorMod = 1;

  let rays = [];

  let ray = { x: 0, y: 0, a: 0 };
  //map x, map y, map pos, depth of field, x offset, y offset, final distance
  let mx, my, mp, dof, xo, yo, disT;

  ray.a = player.a - DR * (fov / 2);
  if (ray.a < 0) ray.a += Math.PI * 2;
  if (ray.a > Math.PI * 2) ray.a -= Math.PI * 2;

  entities().forEach((e) => (e.drawn = false));

  for (let r = 0; r < view.width / horRes; r++) {
    //#region other
    let isVertical, isLeft, isUp;
    let mpv = { x: 1, y: 0 };
    let mph = { x: 0, y: 0 };
    //#endregion

    //#region ---horizontal line check---
    dof = 0;
    //horizontal ray distance, x, y
    let disH = 1000000;
    let hx = player.x;
    let hy = player.y;

    let aTan = -1 / Math.tan(ray.a);
    if (ray.a > Math.PI) {
      //looking up
      ray.y = ((Math.trunc(player.y) >> 6) << 6) - 0.0001;
      ray.x = (player.y - ray.y) * aTan + player.x;
      yo = -Map.size;
      xo = -yo * aTan;
      isUp = true;
    }
    if (ray.a < Math.PI) {
      //looking down
      ray.y = ((Math.trunc(player.y) >> 6) << 6) + Map.size;
      ray.x = (player.y - ray.y) * aTan + player.x;
      yo = Map.size;
      xo = -yo * aTan;
      isUp = false;
    }
    if (ray.a == 0 || ray.a == Math.PI) {
      //looking straight left or right
      ray.x = player.x;
      ray.y = player.y;
      dof = DOF;
    }
    while (dof < DOF) {
      mx = Math.trunc(ray.x) >> 6;
      my = Math.trunc(ray.y) >> 6;
      //mp = my * map.width + mx;
      if (
        mx < map.width &&
        mx >= 0 &&
        my >= 0 &&
        my < map.height &&
        map[my][mx] > 0
      ) {
        //hit wall
        hx = ray.x;
        hy = ray.y;
        disH = dist(player.x, player.y, hx, hy);
        mph.x = mx;
        mph.y = my;
        //mph = mp;
        dof = DOF;
      } else {
        ray.x += xo;
        ray.y += yo;
        dof += 1;
      }
    }
    //#endregion

    //#region ---vertical line check---
    dof = 0;
    //vertical ray distance, x, y
    let disV = 1000000;
    let vx = player.x;
    let vy = player.y;

    let nTan = -Math.tan(ray.a);
    if (ray.a > P2 && ray.a < P3) {
      //looking left
      ray.x = ((Math.trunc(player.x) >> 6) << 6) - 0.0001;
      ray.y = (player.x - ray.x) * nTan + player.y;
      xo = -Map.size;
      yo = -xo * nTan;
      isLeft = true;
    }
    if (ray.a < P2 || ray.a > P3) {
      //looking right
      ray.x = ((Math.trunc(player.x) >> 6) << 6) + Map.size;
      ray.y = (player.x - ray.x) * nTan + player.y;
      xo = Map.size;
      yo = -xo * nTan;
      isLeft = false;
    }
    if (ray.a == 0 || ray.a == Math.PI) {
      //looking straight up or down
      ray.x = player.x;
      ray.y = player.y;
      dof = DOF;
    }
    while (dof < DOF) {
      mx = Math.trunc(ray.x) >> 6;
      my = Math.trunc(ray.y) >> 6;
      if (
        mx >= 0 &&
        my >= 0 &&
        mx < map.width &&
        my < map.height &&
        map[my][mx] > 0
      ) {
        //hit wall
        vx = ray.x;
        vy = ray.y;
        disV = dist(player.x, player.y, vx, vy);
        mpv.x = mx;
        mpv.y = my;
        dof = DOF;
      } else {
        ray.x += xo;
        ray.y += yo;
        dof += 1;
      }
    }
    //#endregion

    //#region  vertical or horizontal
    if (disV <= disH) {
      ray.x = vx;
      ray.y = vy;
      disT = disV;
      isVertical = true;
      colorMod = 1;
      mp = mpv;
    }
    if (disH < disV) {
      ray.x = hx;
      ray.y = hy;
      disT = disH;
      isVertical = false;
      colorMod = 0.7;
      mp = mph;
    }
    //#endregion

    //#region enemies
    let rls = { x1: ray.x, y1: ray.y, x2: player.x, y2: player.y }; //ray line segment
    entities().forEach((e) => {
      let els1 = {
        x1: e.x - e.size,
        y1: e.y - e.size,
        x2: e.x + e.size,
        y2: e.y + e.size,
      }; //enemy line segment 1
      let els2 = {
        x1: e.x + e.size,
        y1: e.y - e.size,
        x2: e.x - e.size,
        y2: e.y + e.size,
      };

      if (!e.drawn && (lineIntersect(rls, els1) || lineIntersect(rls, els2))) {
        if (drawMap) {
          map_ctx.beginPath();
          map_ctx.moveTo(ray.x, ray.y);
          map_ctx.lineTo(player.x, player.y);
          map_ctx.strokeStyle = "pink";
          map_ctx.stroke();
        }
        e.drawn = true;
      }
    });
    //#endregion

    //#region draw 2d
    if (drawRays && drawMap) {
      map_ctx.beginPath();
      map_ctx.moveTo(player.x, player.y);
      map_ctx.lineTo(ray.x, ray.y);
      map_ctx.strokeStyle = "red";
      map_ctx.lineWidth = 1;
      map_ctx.stroke();
    }
    //#endregion

    rays.push({
      ray: { x: ray.x, y: ray.y, a: ray.a },
      mp: { x: mp.x, y: mp.y },
      disT,
      isVertical,
      isUp,
      isLeft,
      r,
      colorMod,
    });

    //#region  change angle of next ray
    ray.a += (fov / view.width) * horRes * DR;
    if (ray.a < 0) ray.a += Math.PI * 2;
    if (ray.a > Math.PI * 2) ray.a -= Math.PI * 2;
    //#endregion
  }

  entities().forEach((e, i) => {
    if (e.drawn) {
      let distToEnemy = dist(e.x, e.y, player.x, player.y);
      rays.push({ disT: distToEnemy, isSprite: true, index: i });
    }
  });

  //sort so it is drawn back to front
  rays.sort((a, b) => b.disT - a.disT);
  rays.forEach((_r) => {
    if (_r.isSprite) {
      entities()[_r.index].draw(dt, player, ctx, map_ctx, view);
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

  //#region draw enemy

  //#endregion
}
let _rays;
let a;

function drawRayWall(ray, mp, disT, isVertical, isUp, isLeft, r, colorMod) {
  let ca = player.a - ray.a;

  //if(disT > DOF * map.size)
  //continue;

  disT *= Math.cos(ca); //fix fisheye
  let lineH = Math.trunc((Map.size * view.height) / disT); //line height

  //if(!mp || !lineH || !dof ){
  //	continue;
  //}
  //let lineO = view.halfHeight - Math.trunc(lineH/2);//line offset
  let lineO = 225 - Math.trunc(lineH / 2);

  let x = mp.x;
  let y = mp.y;

  let imgID = map[y][x];

  if (imgID > 0 && walls[imgID] != null) {
    let percentage;
    if (!isVertical && isUp) {
      //bottom face
      percentage = (ray.x % Map.size) / Map.size;
    } else if (!isVertical && !isUp) {
      //top face
      percentage = 1 - (ray.x % Map.size) / Map.size;
    } else if (isVertical && !isLeft) {
      //left face
      percentage = (ray.y % Map.size) / Map.size;
    } else if (isVertical && isLeft) {
      //right face
      percentage = 1 - (ray.y % Map.size) / Map.size;
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

    ctx.globalAlpha =
      1 -
      Math.min(Math.min(lineH, view.height) / view.height + 0.3, 1) * colorMod;
    ctx.fillStyle = "black";
    ctx.fillRect(r * horRes, lineO, horRes, lineH);
    ctx.globalAlpha = 1.0;
  } else if (imgID > 0) {
    ctx.beginPath();
    ctx.moveTo(r * horRes + halfHorRes, lineO);
    ctx.lineTo(r * horRes + halfHorRes, lineH + lineO);
    ctx.strokeStyle = `rgb(${
      Math.min(Math.min(lineH, view.height) / view.height + 0.2, 1) *
      200 *
      colorMod
    },0,0)`;
    ctx.lineWidth = horRes;
    ctx.stroke();
  }
}

function calculateDeltaTime() {
  let now = performance.now();
  let lt = lastTime;
  lastTime = now;
  return (now - lt) / 1000;
}

function changeQualityHandler(e) {
  updateHorRes(e.target.value);
}

function drawUI() {
  ctx.fillStyle = "green";
  ctx.fillRect(0, 450, view.width, 150);
  ctx.beginPath();
  //400,255
  ctx.moveTo(400, 200);
  ctx.lineTo(400, 210);

  ctx.moveTo(400, 240);
  ctx.lineTo(400, 250);

  ctx.moveTo(415, 225);
  ctx.lineTo(425, 225);

  ctx.moveTo(385, 225);
  ctx.lineTo(375, 225);

  ctx.strokeStyle = "green";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = "black";
  ctx.font = "30px Arial";
  ctx.fillText("WASD or Arrow Keys to move", 10, 485);
  ctx.fillText("SPACE to shoot", 10, 520);
}
