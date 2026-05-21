import { P2, P3, TWO_PI, DR, DOF } from '../config/constants.js'
import { lineIntersect, dist, norm } from '../math/geometry.js'
import { GameMap } from '../map/game-map.js'

function isIgnoredTile(ignoreTile, tileX, tileY) {
  return ignoreTile && ignoreTile.x === tileX && ignoreTile.y === tileY
}

export function normalizeAngle(angle) {
  angle %= TWO_PI
  return angle < 0 ? angle + TWO_PI : angle
}

export function castSceneRays(state, entitiesList) {
  const rays = []
  const columnCount = state.render.view.width / state.render.horRes
  const angleStep = (state.render.fov / state.render.view.width) * state.render.horRes * DR
  let rayAngle = normalizeAngle(state.world.player.a - DR * (state.render.fov / 2))

  for (let r = 0; r < columnCount; r++) {
    const rayData = castSceneRay(state, rayAngle, r)
    const raySegment = {
      x1: rayData.ray.x,
      y1: rayData.ray.y,
      x2: state.world.player.x,
      y2: state.world.player.y,
    }

    entitiesList.forEach(entity => {
      if (entity.sprite?.visible) return

      const diag1 = {
        x1: entity.x - entity.size,
        y1: entity.y - entity.size,
        x2: entity.x + entity.size,
        y2: entity.y + entity.size,
      }
      const diag2 = {
        x1: entity.x + entity.size,
        y1: entity.y - entity.size,
        x2: entity.x - entity.size,
        y2: entity.y + entity.size,
      }

      if (lineIntersect(raySegment, diag1) || lineIntersect(raySegment, diag2)) {
        if (state.render.drawMap) {
          state.render.mapCtx.beginPath()
          state.render.mapCtx.moveTo(rayData.ray.x, rayData.ray.y)
          state.render.mapCtx.lineTo(state.world.player.x, state.world.player.y)
          state.render.mapCtx.strokeStyle = 'pink'
          state.render.mapCtx.stroke()
        }
        entity.sprite.visible = true
      }
    })

    if (state.render.drawRays && state.render.drawMap && rayData.hit) {
      state.render.mapCtx.beginPath()
      state.render.mapCtx.moveTo(state.world.player.x, state.world.player.y)
      state.render.mapCtx.lineTo(rayData.ray.x, rayData.ray.y)
      state.render.mapCtx.strokeStyle = 'red'
      state.render.mapCtx.lineWidth = 1
      state.render.mapCtx.stroke()
    }

    applyFog(state, rayData)
    rays.push(rayData)
    rayAngle = normalizeAngle(rayAngle + angleStep)
  }

  return rays
}

export function castSceneRay(state, angle, column, ignoreTile = null) {
  const horizontalHit = castHorizontalRay(state, angle, ignoreTile)
  const verticalHit = castVerticalRay(state, angle, ignoreTile)
  const useVertical = verticalHit.distance <= horizontalHit.distance
  const chosen = useVertical ? verticalHit : horizontalHit
  const hit = chosen.hit
  const referencePoint = hit ? chosen.point : getFarRayPoint(state, angle)
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

export function castHorizontalRay(state, angle, ignoreTile = null) {
  const map = state.world.map
  const player = state.world.player

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
    rayY = Math.floor(player.y / GameMap.size) * GameMap.size - 0.0001
    rayX = (player.y - rayY) * aTan + player.x
    yo = -GameMap.size
    xo = -yo * aTan
    isUp = true
  } else if (angle < Math.PI) {
    rayY = Math.floor(player.y / GameMap.size) * GameMap.size + GameMap.size
    rayX = (player.y - rayY) * aTan + player.x
    yo = GameMap.size
    xo = -yo * aTan
    isUp = false
  } else {
    dof = DOF
  }

  while (dof < DOF) {
    const mx = Math.trunc(rayX) >> 6
    const my = Math.trunc(rayY) >> 6

    if (mx >= 0 && my >= 0 && mx < map.width && my < map.height && map[my][mx] > 0) {
      if (isIgnoredTile(ignoreTile, mx, my)) {
        rayX += xo
        rayY += yo
        hx = rayX
        hy = rayY
        dof += 1
        continue
      }

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

export function castVerticalRay(state, angle, ignoreTile = null) {
  const map = state.world.map
  const player = state.world.player

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
    rayX = Math.floor(player.x / GameMap.size) * GameMap.size - 0.0001
    rayY = (player.x - rayX) * nTan + player.y
    xo = -GameMap.size
    yo = -xo * nTan
    isLeft = true
  } else if (angle < P2 || angle > P3) {
    rayX = Math.floor(player.x / GameMap.size) * GameMap.size + GameMap.size
    rayY = (player.x - rayX) * nTan + player.y
    xo = GameMap.size
    yo = -xo * nTan
    isLeft = false
  } else {
    dof = DOF
  }

  while (dof < DOF) {
    const mx = Math.trunc(rayX) >> 6
    const my = Math.trunc(rayY) >> 6

    if (mx >= 0 && my >= 0 && mx < map.width && my < map.height && map[my][mx] > 0) {
      if (isIgnoredTile(ignoreTile, mx, my)) {
        rayX += xo
        rayY += yo
        vx = rayX
        vy = rayY
        dof += 1
        continue
      }

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

export function applyFog(state, rayData) {
  if (!state.render.fogEnabled) return
  if (rayData.hit && rayData.disT <= state.render.fog.END) return

  const rayNorm = norm({
    x: rayData.ray.x - state.world.player.x,
    y: rayData.ray.y - state.world.player.y,
  })

  rayData.ray.x = state.world.player.x + rayNorm.x * state.render.fog.END
  rayData.ray.y = state.world.player.y + rayNorm.y * state.render.fog.END
  rayData.disT = state.render.fog.END
  rayData.mp = null
  rayData.colorMod = 0
}

export function getFarRayPoint(state, angle) {
  const direction = { x: Math.cos(angle), y: Math.sin(angle) }
  return {
    x: state.world.player.x + direction.x * GameMap.size * DOF,
    y: state.world.player.y + direction.y * GameMap.size * DOF,
  }
}
