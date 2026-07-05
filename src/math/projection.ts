import { DR, TWO_PI } from '../config/constants.js'

export type CameraSpacePoint = {
  lateral: number
  depth: number
}

export type CameraBasis = {
  cosAngle: number
  sinAngle: number
  playerX: number
  playerY: number
}

export function getProjectionPlaneDistance(viewWidth: number, fovDegrees: number) {
  return viewWidth / (2 * Math.tan((fovDegrees * DR) / 2))
}

export function getScreenColumnCenter(column: number, columnWidth: number) {
  return column * columnWidth + columnWidth * 0.5
}

export function getRayAngleForScreenX(
  playerAngle: number,
  screenX: number,
  viewWidth: number,
  projectionPlaneDistance: number,
) {
  return normalizeAngle(
    playerAngle + Math.atan((screenX - viewWidth * 0.5) / projectionPlaneDistance),
  )
}

export function getCameraBasis(playerX: number, playerY: number, angle: number): CameraBasis {
  return {
    cosAngle: Math.cos(angle),
    sinAngle: Math.sin(angle),
    playerX,
    playerY,
  }
}

export function worldToCameraSpace(
  basis: CameraBasis,
  worldX: number,
  worldY: number,
): CameraSpacePoint {
  const dx = worldX - basis.playerX
  const dy = worldY - basis.playerY

  return {
    lateral: -dx * basis.sinAngle + dy * basis.cosAngle,
    depth: dx * basis.cosAngle + dy * basis.sinAngle,
  }
}

function normalizeAngle(angle: number) {
  angle %= TWO_PI
  return angle < 0 ? angle + TWO_PI : angle
}
