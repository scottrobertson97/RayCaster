import { GameMap } from '../map/game-map.js'
import { WORLD_HEIGHT_RATIO } from '../config/constants.js'

export function drawRayWall(state, rayData) {
  const { ray, mp, isVertical, isUp, isLeft, r, colorMod } = rayData
  const ctx = state.ctx

  let disT = rayData.disT
  const ca = state.player.a - ray.a

  disT *= Math.cos(ca)
  const lineH = Math.trunc((GameMap.size * state.view.height * WORLD_HEIGHT_RATIO) / disT)
  const lineO = (state.view.height * WORLD_HEIGHT_RATIO) / 2 - Math.trunc(lineH / 2)

  if (!mp) {
    ctx.beginPath()
    ctx.moveTo(r * state.horRes + state.halfHorRes, lineO)
    ctx.lineTo(r * state.horRes + state.halfHorRes, lineH + lineO)
    ctx.strokeStyle = 'white'
    ctx.lineWidth = state.horRes
    ctx.stroke()
    return
  }

  const x = mp.x
  const y = mp.y
  const imgID = state.map[y][x]

  if (imgID > 0 && state.walls[imgID]) {
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

    const pixelX = Math.trunc(state.walls[imgID].width * percentage)

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
    )

    ctx.globalAlpha =
      1 - Math.min(Math.min(lineH, state.view.height) / state.view.height + 0.3, 1) * colorMod
    ctx.fillStyle = 'black'
    ctx.fillRect(r * state.horRes, lineO, state.horRes, lineH)
    ctx.globalAlpha = 1
  } else if (imgID > 0) {
    ctx.beginPath()
    ctx.moveTo(r * state.horRes + state.halfHorRes, lineO)
    ctx.lineTo(r * state.horRes + state.halfHorRes, lineH + lineO)
    ctx.strokeStyle = `rgb(${Math.min(Math.min(lineH, state.view.height) / state.view.height + 0.2, 1) * 200 * colorMod},0,0)`
    ctx.lineWidth = state.horRes
    ctx.stroke()
  }
}
