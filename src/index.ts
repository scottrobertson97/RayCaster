import { Map } from './map'
import { Player } from './player'
import { Enemy } from './enemy'
import { Entity } from './entity'
import { Keyboard } from './keyboard'
import { lineIntersect, pointInsideAABB, dist, norm } from './helper'
import { walls } from './textures'
import type { Bullet } from './bullet'

;('use strict')

window.addEventListener('load', init)

const c = document.getElementById('view') as HTMLCanvasElement
const ctx = c.getContext('2d')!
const map_c = document.getElementById('map') as HTMLCanvasElement
const map_ctx = map_c.getContext('2d')!

let drawMap = false
let fogEnabled = false

const P2 = Math.PI / 2
const P3 = (3 * Math.PI) / 2
const TWO_PI = Math.PI * 2
const DR = Math.PI / 180 // one degree in radians
const RD = 180 / Math.PI // one radian in degrees
const DOF = 100
const FOG = { START: 3 * Map.size, END: 9 * Map.size }

interface Viewport {
  width: number
  height: number
  halfHeight: number
}

const view: Viewport = {
  get width() {
    return c.width
  },
  get height() {
    return c.height
  },
  get halfHeight() {
    return c.height / 2
  },
}

let fov = 90
let horRes = 8 // horizontal resolution, higher number = less resolution
let halfHorRes = horRes / 2
let drawRays = true
function updateHorRes(num: number | string) {
  horRes = Number(num)
  halfHorRes = horRes / 2
}
function normalizeAngle(angle: number) {
  angle %= TWO_PI
  return angle < 0 ? angle + TWO_PI : angle
}

interface EntityStore {
  bullets: Entity[]
  enemies: Entity[]
  getEntities(): Entity[]
}

const entityStore: EntityStore = {
  bullets: [],
  enemies: [],
  getEntities() {
    return this.enemies.concat(this.bullets)
  },
}
const { bullets, enemies } = entityStore
const spawnBullet = (bullet: Bullet) => {
  entityStore.bullets.push(bullet)
}

const mapMatrix: number[][] = [
  [1, 2, 2, 2, 0, 1, 1, 1, 1, 1, 2, 2, 1],
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
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]
const map = new Map(mapMatrix)

const myKeys = new Keyboard()
const player = new Player(300, 300)

enemies.push(new Enemy(600, 450, 10, 'https://i.imgur.com/FcIXhVp.png'))
enemies.push(
  new Enemy(200, 700, 10, [
    'https://i.imgur.com/rAFkpSc.png',
    'https://i.imgur.com/rYCrqax.png',
    'https://i.imgur.com/p5w5cCU.png',
  ])
)
insetSprite()

let lastTime = 0 // used by calculateDeltaTime()
let dt = 0

function init() {
  document
    .querySelectorAll('input[type="radio"][name="quality"]')
    .forEach(r => {
      r.addEventListener('change', changeQualityHandler)
    })
  updateHorRes(8)

  map_c.width = map[0].length * Map.size
  map_c.height = map.length * Map.size
  map_ctx.imageSmoothingEnabled = false
  ctx.imageSmoothingEnabled = false

  window.toggleMap = toggleMap
  window.toggleFog = toggleFog

  update()
}

function insetSprite() {
  enemies.push(new Entity(600, 750, 40, 'https://i.imgur.com/rgwwS0K.png'))
}

function update() {
  dt = calculateDeltaTime()
  player.update(dt, myKeys, map, spawnBullet)
  updateEntities()
  draw(dt)
  myKeys.previousKeydown = myKeys.keydown.slice()
  requestAnimationFrame(update)
}

function draw(dt: number) {
  map.draw(map_ctx, map_c, { drawMap, textures: walls })
  drawRays2D(dt)
  player.draw2D(map_ctx, drawMap)
  drawEntities()
  drawUI()
}

function getEntities(): Entity[] {
  return entityStore.getEntities()
}

function forEachEntity(callback: (entity: Entity) => void) {
  getEntities().forEach(callback)
}

function resolveBulletCollisions() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i]
    if (!(bullet as unknown as any).isAlive) {
      bullets.splice(i, 1)
      continue
    }

    const bulletTileX = Math.trunc(bullet.x) >> 6
    const bulletTileY = Math.trunc(bullet.y) >> 6
    if (
      bulletTileY < 0 ||
      bulletTileY >= map.length ||
      bulletTileX < 0 ||
      bulletTileX >= map[0].length
    ) {
      bullets.splice(i, 1)
      continue
    }

    if (map[bulletTileY][bulletTileX] > 0) {
      bullets.splice(i, 1)
      continue
    }

    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j]
      if (pointInsideAABB(bullet.point, enemy.min, enemy.max)) {
        bullets.splice(i, 1)
        enemies.splice(j, 1)
        break
      }
    }
  }
}

function updateEntities() {
  forEachEntity(e => e.update(player, norm, map))
  resolveBulletCollisions()
}

function drawEntities() {
  forEachEntity(e => e.draw2D(map_ctx, drawMap))
}

function drawRays2D(dt: number) {
  fillSceneBackground()
  const visibleEntities = getEntities()
  visibleEntities.forEach(entity => {
    entity.drawn = false
  })

  const rays: any[] = castSceneRays(visibleEntities)
  addEntityRays(rays, visibleEntities)

  rays.sort((a, b) => b.disT - a.disT)
  const drawOptions = { fov, drawMap }
  rays.forEach(_r => {
    if (_r.isSprite) {
      visibleEntities[_r.index].draw(
        dt,
        player,
        ctx,
        map_ctx,
        view,
        drawOptions
      )
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
      )
    }
  })

  _rays = rays
}

function fillSceneBackground() {
  let gradient = ctx.createLinearGradient(0, 0, 0, view.height * 0.75)
  gradient.addColorStop(0, '#555')
  gradient.addColorStop(0.4, '#222')
  gradient.addColorStop(0.5, '#222')
  gradient.addColorStop(0.5, '#555')
  gradient.addColorStop(0.6, '#555')
  gradient.addColorStop(1, '#888')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, view.width, view.height * 0.75)
}

function castSceneRays(entitiesList: Entity[]) {
  const rays = []
  const columnCount = view.width / horRes
  const angleStep = (fov / view.width) * horRes * DR
  let rayAngle = normalizeAngle(player.a - DR * (fov / 2))

  for (let r = 0; r < columnCount; r++) {
    const rayData = castSceneRay(rayAngle, r)
    const raySegment = {
      x1: rayData.ray.x,
      y1: rayData.ray.y,
      x2: player.x,
      y2: player.y,
    }

    entitiesList.forEach(entity => {
      if (entity.drawn) return
      const els1 = {
        x1: entity.x - entity.size,
        y1: entity.y - entity.size,
        x2: entity.x + entity.size,
        y2: entity.y + entity.size,
      }
      const els2 = {
        x1: entity.x + entity.size,
        y1: entity.y - entity.size,
        x2: entity.x - entity.size,
        y2: entity.y + entity.size,
      }

      if (lineIntersect(raySegment, els1) || lineIntersect(raySegment, els2)) {
        if (drawMap) {
          map_ctx.beginPath()
          map_ctx.moveTo(rayData.ray.x, rayData.ray.y)
          map_ctx.lineTo(player.x, player.y)
          map_ctx.strokeStyle = 'pink'
          map_ctx.stroke()
        }
        entity.drawn = true
      }
    })

    if (drawRays && drawMap && rayData.hit) {
      map_ctx.beginPath()
      map_ctx.moveTo(player.x, player.y)
      map_ctx.lineTo(rayData.ray.x, rayData.ray.y)
      map_ctx.strokeStyle = 'red'
      map_ctx.lineWidth = 1
      map_ctx.stroke()
    }

    applyFog(rayData)
    rays.push(rayData)
    rayAngle = normalizeAngle(rayAngle + angleStep)
  }

  return rays
}

function castSceneRay(angle: number, column: number) {
  const horizontalHit = castHorizontalRay(angle)
  const verticalHit = castVerticalRay(angle)
  const useVertical = verticalHit.distance <= horizontalHit.distance
  const chosen = useVertical ? verticalHit : horizontalHit
  const hit = chosen.hit
  const referencePoint = hit ? chosen.point : getFarRayPoint(angle)
  const mapPoint = hit && chosen.map ? { ...chosen.map } : null
  return {
    ray: { x: referencePoint.x, y: referencePoint.y, a: angle },
    mp: mapPoint,
    disT: hit ? chosen.distance : Infinity,
    isVertical: useVertical,
    isUp: horizontalHit.isUp,
    isLeft: verticalHit.isLeft,
    r: column,
    colorMod: useVertical ? 1 : 0.65,
    hit,
  }
}

function castHorizontalRay(angle: number) {
  let rayX = player.x
  let rayY = player.y
  let xo = 0
  let yo = 0
  let dof = 0
  let isUp = false
  let distance = Infinity
  let mp = null
  let hx = player.x
  let hy = player.y

  const aTan = -1 / Math.tan(angle)

  if (angle > Math.PI) {
    rayY = Math.floor(player.y / Map.size) * Map.size - 0.0001
    rayX = (player.y - rayY) * aTan + player.x
    yo = -Map.size
    xo = -yo * aTan
    isUp = true
  } else if (angle < Math.PI) {
    rayY = Math.floor(player.y / Map.size) * Map.size + Map.size
    rayX = (player.y - rayY) * aTan + player.x
    yo = Map.size
    xo = -yo * aTan
    isUp = false
  } else {
    dof = DOF
  }

  while (dof < DOF) {
    const mx = Math.trunc(rayX) >> 6
    const my = Math.trunc(rayY) >> 6
    if (
      mx >= 0 &&
      my >= 0 &&
      mx < map.width &&
      my < map.height &&
      map[my][mx] > 0
    ) {
      hx = rayX
      hy = rayY
      distance = dist(player.x, player.y, hx, hy)
      mp = { x: mx, y: my }
      break
    }
    rayX += xo
    rayY += yo
    hx = rayX
    hy = rayY
    dof += 1
  }

  return { hit: mp !== null, distance, point: { x: hx, y: hy }, map: mp, isUp }
}

function castVerticalRay(angle: number) {
  let rayX = player.x
  let rayY = player.y
  let xo = 0
  let yo = 0
  let dof = 0
  let isLeft = false
  let distance = Infinity
  let mp = null
  let vx = player.x
  let vy = player.y

  const nTan = -Math.tan(angle)

  if (angle > P2 && angle < P3) {
    rayX = Math.floor(player.x / Map.size) * Map.size - 0.0001
    rayY = (player.x - rayX) * nTan + player.y
    xo = -Map.size
    yo = -xo * nTan
    isLeft = true
  } else if (angle < P2 || angle > P3) {
    rayX = Math.floor(player.x / Map.size) * Map.size + Map.size
    rayY = (player.x - rayX) * nTan + player.y
    xo = Map.size
    yo = -xo * nTan
    isLeft = false
  } else {
    dof = DOF
  }

  while (dof < DOF) {
    const mx = Math.trunc(rayX) >> 6
    const my = Math.trunc(rayY) >> 6
    if (
      mx >= 0 &&
      my >= 0 &&
      mx < map.width &&
      my < map.height &&
      map[my][mx] > 0
    ) {
      vx = rayX
      vy = rayY
      distance = dist(player.x, player.y, vx, vy)
      mp = { x: mx, y: my }
      break
    }
    rayX += xo
    rayY += yo
    vx = rayX
    vy = rayY
    dof += 1
  }

  return {
    hit: mp !== null,
    distance,
    point: { x: vx, y: vy },
    map: mp,
    isLeft,
  }
}

function addEntityRays(rays: any[], entitiesList: Entity[]) {
  entitiesList.forEach((entity, index) => {
    if (entity.drawn) {
      rays.push({
        disT: dist(entity.x, entity.y, player.x, player.y),
        isSprite: true,
        index,
      })
    }
  })
}

function applyFog(rayData: any) {
  if (!fogEnabled) return
  if (rayData.hit && rayData.disT <= FOG.END) return
  const rayNorm = norm({
    x: rayData.ray.x - player.x,
    y: rayData.ray.y - player.y,
  })
  rayData.ray.x = player.x + rayNorm.x * FOG.END
  rayData.ray.y = player.y + rayNorm.y * FOG.END
  rayData.disT = FOG.END
  rayData.mp = null
  rayData.colorMod = 0
}

function getFarRayPoint(angle: number) {
  const direction = { x: Math.cos(angle), y: Math.sin(angle) }
  return {
    x: player.x + direction.x * Map.size * DOF,
    y: player.y + direction.y * Map.size * DOF,
  }
}

let _rays

function drawRayWall(
  ray: { a: number; x: number; y: number },
  mp: { x: any; y: any },
  disT: number,
  isVertical: any,
  isUp: any,
  isLeft: any,
  r: number,
  colorMod: number
) {
  let ca = player.a - ray.a

  disT *= Math.cos(ca)
  let lineH = Math.trunc((Map.size * view.height * 0.75) / disT)
  let lineO = (view.height * 0.75) / 2 - Math.trunc(lineH / 2)

  if (!mp) {
    ctx.beginPath()
    ctx.moveTo(r * horRes + halfHorRes, lineO)
    ctx.lineTo(r * horRes + halfHorRes, lineH + lineO)
    ctx.strokeStyle = 'white'
    ctx.lineWidth = horRes
    ctx.stroke()
    return
  }

  const x = mp.x
  const y = mp.y
  const imgID = map[y][x]
  if (imgID > 0 && walls[imgID]) {
    let percentage = 1
    if (!isVertical && isUp) {
      percentage = (ray.x % Map.size) / Map.size
    } else if (!isVertical && !isUp) {
      percentage = 1 - (ray.x % Map.size) / Map.size
    } else if (isVertical && !isLeft) {
      percentage = (ray.y % Map.size) / Map.size
    } else if (isVertical && isLeft) {
      percentage = 1 - (ray.y % Map.size) / Map.size
    }

    let pixelX = Math.trunc(walls[imgID].width * percentage)

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
    )

    ctx.globalAlpha =
      1 -
      Math.min(Math.min(lineH, view.height) / view.height + 0.3, 1) * colorMod
    ctx.fillStyle = 'black'
    ctx.fillRect(r * horRes, lineO, horRes, lineH)
    ctx.globalAlpha = 1.0
  } else if (imgID > 0) {
    ctx.beginPath()
    ctx.moveTo(r * horRes + halfHorRes, lineO)
    ctx.lineTo(r * horRes + halfHorRes, lineH + lineO)
    ctx.strokeStyle = `rgb(${
      Math.min(Math.min(lineH, view.height) / view.height + 0.2, 1) *
      200 *
      colorMod
    },0,0)`
    ctx.lineWidth = horRes
    ctx.stroke()
  }
}

function calculateDeltaTime() {
  const now = performance.now()
  const lt = lastTime
  lastTime = now
  return (now - lt) / 1000
}

function changeQualityHandler(e: any) {
  updateHorRes(e.target.value)
}

function drawUI() {
  ctx.fillStyle = 'green'
  ctx.fillRect(0, view.height * 0.75, view.width, view.height * 0.25)
  ctx.beginPath()

  const crosshairLineWidth = 4
  const space = 10
  const width = 15
  ctx.moveTo(view.width * 0.5, view.halfHeight * 0.75 - space - width)
  ctx.lineTo(view.width * 0.5, view.halfHeight * 0.75 - space)

  ctx.moveTo(view.width * 0.5, view.halfHeight * 0.75 + space + width)
  ctx.lineTo(view.width * 0.5, view.halfHeight * 0.75 + space)

  ctx.moveTo(view.width * 0.5 - space - width, view.halfHeight * 0.75)
  ctx.lineTo(view.width * 0.5 - space, view.halfHeight * 0.75)

  ctx.moveTo(view.width * 0.5 + space + width, view.halfHeight * 0.75)
  ctx.lineTo(view.width * 0.5 + space, view.halfHeight * 0.75)

  ctx.strokeStyle = 'green'
  ctx.lineWidth = crosshairLineWidth
  ctx.stroke()

  ctx.fillStyle = 'black'
  const fontSize = 30
  ctx.font = `${fontSize}px Arial`
  ctx.fillText(
    'WASD or Arrow Keys to move',
    10,
    view.height * 0.75 + fontSize + 5
  )
  ctx.fillText('SPACE to shoot', 10, view.height * 0.75 + (fontSize + 5) * 2)
  ctx.fillText(
    `${Math.trunc(1 / dt)} fps`,
    10,
    view.height * 0.75 + (fontSize + 5) * 3
  )
}

function toggleMap() {
  drawMap = !drawMap
  map_c.style.display = drawMap ? 'block' : 'none'
}

function toggleFog() {
  fogEnabled = !fogEnabled
}

declare global {
  interface Window {
    toggleMap: () => void
    toggleFog: () => void
  }
}
