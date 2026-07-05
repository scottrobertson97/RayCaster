import { WORLD_HEIGHT_RATIO } from '../config/constants.js'
import {
  getCameraBasis,
  getProjectionPlaneDistance,
  worldToCameraSpace,
  type CameraBasis,
  type CameraSpacePoint,
} from '../math/projection.js'
import { GameMap } from '../map/game-map.js'
import type { GameState } from '../types.js'

type FloorProjectionParams = CameraBasis & {
  floorScale: number
  horizonY: number
  nearDepth: number
  projectionPlaneDistance: number
  viewWidth: number
}

const FLOOR_GRID_COLOR = 'rgba(235, 235, 220, 0.18)'
const MAX_PROJECTED_COORDINATE = 100_000

export function fillSceneBackground(state: GameState) {
  const worldHeight = state.render.view.height * WORLD_HEIGHT_RATIO
  const pitchOffsetPx = Math.tan(state.world.player.pitch) * (worldHeight * 0.5)
  const unclampedHorizonY = worldHeight * 0.5 + pitchOffsetPx
  const horizonY = Math.max(0, Math.min(worldHeight, unclampedHorizonY))

  if (horizonY > 0) {
    const skyGradient = state.render.ctx.createLinearGradient(0, 0, 0, horizonY)
    skyGradient.addColorStop(0, '#666')
    skyGradient.addColorStop(1, '#222')
    state.render.ctx.fillStyle = skyGradient
    state.render.ctx.fillRect(0, 0, state.render.view.width, horizonY)
  }

  if (horizonY < worldHeight) {
    const floorGradient = state.render.ctx.createLinearGradient(0, horizonY, 0, worldHeight)
    floorGradient.addColorStop(0, '#555')
    floorGradient.addColorStop(1, '#888')
    state.render.ctx.fillStyle = floorGradient
    state.render.ctx.fillRect(0, horizonY, state.render.view.width, worldHeight - horizonY)
    drawFloorGrid(state, horizonY, worldHeight)
  }
}

function drawFloorGrid(state: GameState, horizonY: number, worldHeight: number) {
  const mapWorldWidth = state.world.map.width * GameMap.size
  const mapWorldHeight = state.world.map.height * GameMap.size

  if (mapWorldWidth <= 0 || mapWorldHeight <= 0) return

  const ctx = state.render.ctx
  const player = state.world.player
  const params: FloorProjectionParams = {
    ...getCameraBasis(player.x, player.y, player.a),
    floorScale: GameMap.size * worldHeight * 0.5,
    horizonY,
    nearDepth: GameMap.size * 0.12,
    projectionPlaneDistance: getProjectionPlaneDistance(state.render.view.width, state.render.fov),
    viewWidth: state.render.view.width,
  }

  ctx.save()
  ctx.beginPath()
  ctx.rect(0, horizonY, state.render.view.width, worldHeight - horizonY)
  ctx.clip()
  ctx.strokeStyle = FLOOR_GRID_COLOR
  ctx.lineWidth = 1

  for (let tileX = 0; tileX <= state.world.map.width; tileX++) {
    const worldX = tileX * GameMap.size
    drawProjectedFloorLine(ctx, params, worldX, 0, worldX, mapWorldHeight)
  }

  for (let tileY = 0; tileY <= state.world.map.height; tileY++) {
    const worldY = tileY * GameMap.size
    drawProjectedFloorLine(ctx, params, 0, worldY, mapWorldWidth, worldY)
  }

  ctx.restore()
}

function drawProjectedFloorLine(
  ctx: CanvasRenderingContext2D,
  params: FloorProjectionParams,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
) {
  const start = worldToCameraSpace(params, startX, startY)
  const end = worldToCameraSpace(params, endX, endY)
  const clipped = clipToNearDepth(start, end, params.nearDepth)

  if (!clipped) return

  const projectedStart = projectFloorPoint(params, clipped.start)
  const projectedEnd = projectFloorPoint(params, clipped.end)

  ctx.beginPath()
  ctx.moveTo(projectedStart.x, projectedStart.y)
  ctx.lineTo(projectedEnd.x, projectedEnd.y)
  ctx.stroke()
}

function clipToNearDepth(
  start: CameraSpacePoint,
  end: CameraSpacePoint,
  nearDepth: number,
): { start: CameraSpacePoint; end: CameraSpacePoint } | null {
  if (start.depth <= nearDepth && end.depth <= nearDepth) return null
  if (start.depth > nearDepth && end.depth > nearDepth) return { start, end }

  const interpolation = (nearDepth - start.depth) / (end.depth - start.depth)
  const clippedPoint = {
    lateral: start.lateral + (end.lateral - start.lateral) * interpolation,
    depth: nearDepth,
  }

  return start.depth <= nearDepth
    ? { start: clippedPoint, end }
    : { start, end: clippedPoint }
}

function projectFloorPoint(params: FloorProjectionParams, point: CameraSpacePoint) {
  return {
    x: clampProjectedCoordinate(
      params.viewWidth * 0.5 + (point.lateral * params.projectionPlaneDistance) / point.depth,
    ),
    y: clampProjectedCoordinate(params.horizonY + params.floorScale / point.depth),
  }
}

function clampProjectedCoordinate(value: number) {
  if (value < -MAX_PROJECTED_COORDINATE) return -MAX_PROJECTED_COORDINATE
  if (value > MAX_PROJECTED_COORDINATE) return MAX_PROJECTED_COORDINATE
  return value
}
