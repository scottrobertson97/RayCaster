import { GameMap } from '../map/game-map.js'
import { WORLD_HEIGHT_RATIO } from '../config/constants.js'
import { getDoorAtTile, shouldRenderThroughDoor } from '../systems/door-system.js'
import { applyFog, castSceneRay } from '../systems/raycast-system.js'

function isDrawableImage(image) {
  return image?.complete && image.naturalWidth > 0 && image.naturalHeight > 0
}

function getWallSamplePercent(ray, isVertical, isUp, isLeft) {
  let percentage = 1

  if (!isVertical && isUp) {
    percentage = (ray.x % GameMap.size) / GameMap.size
  } else if (!isVertical && !isUp) {
    percentage = 1 - (ray.x % GameMap.size) / GameMap.size
  } else if (isVertical && !isLeft) {
    percentage = (ray.y % GameMap.size) / GameMap.size
  } else if (isVertical && isLeft) {
    percentage = 1 - (ray.y % GameMap.size) / GameMap.size
  }

  if (percentage < 0) return 0
  if (percentage > 0.9999) return 0.9999
  return percentage
}

function drawBehindDoorRay(state, rayData) {
  const behindRayData = castSceneRay(state, rayData.ray.a, rayData.r, rayData.mp)
  applyFog(state, behindRayData)
  drawRayWall(state, behindRayData)
}

export function drawRayWall(state, rayData) {
  const { ray, mp, isVertical, isUp, isLeft, r, colorMod } = rayData
  const ctx = state.render.ctx

  const worldHeight = state.render.view.height * WORLD_HEIGHT_RATIO
  const pitchOffsetPx = Math.tan(state.world.player.pitch) * (worldHeight * 0.5)

  let disT = rayData.disT
  const ca = state.world.player.a - ray.a

  disT *= Math.cos(ca)
  const lineH = Math.trunc((GameMap.size * worldHeight) / disT)
  const lineO = worldHeight / 2 - Math.trunc(lineH / 2) + pitchOffsetPx

  if (!mp) {
    ctx.beginPath()
    ctx.moveTo(r * state.render.horRes + state.render.halfHorRes, lineO)
    ctx.lineTo(r * state.render.horRes + state.render.halfHorRes, lineH + lineO)
    ctx.strokeStyle = 'white'
    ctx.lineWidth = state.render.horRes
    ctx.stroke()
    return
  }

  const x = mp.x
  const y = mp.y
  const imgID = state.world.map[y][x]
  const percentage = getWallSamplePercent(ray, isVertical, isUp, isLeft)
  const door = getDoorAtTile(state, x, y)

  if (shouldRenderThroughDoor(door, percentage)) {
    drawBehindDoorRay(state, rayData)
    return
  }

  const texture = state.assets.walls[imgID]

  if (imgID > 0 && isDrawableImage(texture)) {
    const pixelX = Math.trunc(texture.width * percentage)

    ctx.drawImage(
      texture,
      pixelX,
      0,
      1,
      texture.height,
      r * state.render.horRes,
      lineO,
      state.render.horRes,
      lineH
    )

    ctx.globalAlpha =
      1 - Math.min(Math.min(lineH, state.render.view.height) / state.render.view.height + 0.3, 1) * colorMod
    ctx.fillStyle = 'black'
    ctx.fillRect(r * state.render.horRes, lineO, state.render.horRes, lineH)
    ctx.globalAlpha = 1
  } else if (imgID > 0) {
    ctx.beginPath()
    ctx.moveTo(r * state.render.horRes + state.render.halfHorRes, lineO)
    ctx.lineTo(r * state.render.horRes + state.render.halfHorRes, lineH + lineO)
    ctx.strokeStyle = `rgb(${Math.min(Math.min(lineH, state.render.view.height) / state.render.view.height + 0.2, 1) * 200 * colorMod},0,0)`
    ctx.lineWidth = state.render.horRes
    ctx.stroke()
  }
}
