import type { LineSegment, Point } from '../types.js'
import { tileToWorld, worldToTile } from './tile-coordinates.js'

export function lineIntersect(l: LineSegment, r: LineSegment) {
  return (
    lineSegmentTouchesOrCrossesLine(l, r) &&
    lineSegmentTouchesOrCrossesLine(r, l)
  )
}

export function AABBIntersect(a1: Point, a2: Point, b1: Point, b2: Point) {
  return a1.x <= b2.x && a2.x >= b1.x && a1.y <= b2.y && a2.y >= b1.y
}

export function pointInsideAABB(p: Point, b1: Point, b2: Point) {
  return AABBIntersect(p, p, b1, b2)
}

export function pointOnLine(l: LineSegment, p: Point) {
  const a = { x: l.x2 - l.x1, y: l.y2 - l.y1 }
  const b = { x: p.x - l.x1, y: p.y - l.y1 }
  const r = crossProduct(a, b)
  return Math.abs(r) < 0.000001
}

export function pointRightOfLine(l: LineSegment, p: Point) {
  const a = { x: l.x2 - l.x1, y: l.y2 - l.y1 }
  const b = { x: p.x - l.x1, y: p.y - l.y1 }
  return crossProduct(a, b) < 0
}

export function crossProduct(a: Point, b: Point) {
  return a.x * b.y - b.x * a.y
}

export function lineSegmentTouchesOrCrossesLine(a: LineSegment, b: LineSegment) {
  const r1 = pointRightOfLine(a, { x: b.x1, y: b.y1 })
  const r2 = pointRightOfLine(a, { x: b.x2, y: b.y2 })
  return (r1 && !r2) || (!r1 && r2)
}

export function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.sqrt(Math.pow(bx - ax, 2) + Math.pow(by - ay, 2))
}

export function norm(vec: Point): Point {
  const mag = dist(vec.x, vec.y, 0, 0)
  return { x: vec.x / mag, y: vec.y / mag }
}

export function roundToWorld(value: number) {
  return tileToWorld(worldToTile(value))
}

export { worldToTile as roundToMap }
