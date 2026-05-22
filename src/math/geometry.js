export function lineIntersect(l, r) {
  return (
    lineSegmentTouchesOrCrossesLine(l, r) &&
    lineSegmentTouchesOrCrossesLine(r, l)
  )
}

export function AABBIntersect(a1, a2, b1, b2) {
  return a1.x <= b2.x && a2.x >= b1.x && a1.y <= b2.y && a2.y >= b1.y
}

export function pointInsideAABB(p, b1, b2) {
  return AABBIntersect(p, p, b1, b2)
}

export function pointOnLine(l, p) {
  const a = { x: l.x2 - l.x1, y: l.y2 - l.y1 }
  const b = { x: p.x - l.x1, y: p.y - l.y1 }
  const r = crossProduct(a, b)
  return Math.abs(r) < 0.000001
}

export function pointRightOfLine(l, p) {
  const a = { x: l.x2 - l.x1, y: l.y2 - l.y1 }
  const b = { x: p.x - l.x1, y: p.y - l.y1 }
  return crossProduct(a, b) < 0
}

export function crossProduct(a, b) {
  return a.x * b.y - b.x * a.y
}

export function lineSegmentTouchesOrCrossesLine(a, b) {
  const r1 = pointRightOfLine(a, { x: b.x1, y: b.y1 })
  const r2 = pointRightOfLine(a, { x: b.x2, y: b.y2 })
  return (r1 && !r2) || (!r1 && r2)
}

export function dist(ax, ay, bx, by) {
  return Math.sqrt(Math.pow(bx - ax, 2) + Math.pow(by - ay, 2))
}

export function norm(vec) {
  const mag = dist(vec.x, vec.y, 0, 0)
  return { x: vec.x / mag, y: vec.y / mag }
}

import { tileToWorld, worldToTile } from './tile-coordinates.js'

export function roundToWorld(value) {
  return tileToWorld(worldToTile(value))
}

export { worldToTile as roundToMap }
