import { createImageAsset } from '../assets/asset-manifest.js'
import { getCameraBasis, getProjectionPlaneDistance, worldToCameraSpace } from '../math/projection.js'
import { GameMap } from '../map/game-map.js'
import type { Entity } from '../entities/entity.js'
import type { AssetRef, GameState, SpriteDescriptor } from '../types.js'

const imageCache = new Map<AssetRef, HTMLImageElement>()

function getSpriteImage(assetRef: AssetRef) {
  if (!imageCache.has(assetRef)) {
    imageCache.set(assetRef, createImageAsset(assetRef))
  }
  return imageCache.get(assetRef)
}

function isDrawableImage(image: HTMLImageElement | undefined): image is HTMLImageElement {
  return Boolean(image && image.complete && image.naturalWidth > 0 && image.naturalHeight > 0)
}

function getImageRatio(image: HTMLImageElement) {
  if (!isDrawableImage(image)) return 1
  return image.width / image.height
}

function getCurrentFrame(sprite: SpriteDescriptor) {
  const frameIndex = Math.min(sprite.frameIndex, sprite.assetRefs.length - 1)
  return getSpriteImage(sprite.assetRefs[frameIndex])
}

function advanceSpriteFrame(sprite: SpriteDescriptor, dt: number) {
  if (sprite.assetRefs.length < 2) return

  sprite.frameTick += dt
  if (sprite.frameTick > sprite.frameRate) {
    sprite.frameTick = 0
    sprite.frameIndex = (sprite.frameIndex + 1) % sprite.assetRefs.length
  }
}

export function drawSpriteEntity(
  entity: Entity,
  state: GameState,
  { pitchOffset = 0 }: { pitchOffset?: number } = {},
) {
  const { sprite } = entity
  if (!sprite) return

  const player = state.world.player
  const view = state.render.view
  const image = getCurrentFrame(sprite)
  if (!isDrawableImage(image)) return

  const projectionPlaneDistance = getProjectionPlaneDistance(view.width, state.render.fov)
  const cameraPoint = worldToCameraSpace(
    getCameraBasis(player.x, player.y, player.a),
    entity.x,
    entity.y,
  )
  if (cameraPoint.depth <= 0) return

  const correctedDistance = cameraPoint.depth
  const lineH = Math.trunc((GameMap.size * view.height * sprite.height) / correctedDistance)
  const lineO = view.halfHeight * 0.75 - Math.trunc(lineH / 2) + pitchOffset
  const width = lineH * getImageRatio(image)
  const cx = view.width * 0.5 + (cameraPoint.lateral * projectionPlaneDistance) / cameraPoint.depth - width / 2
  state.render.ctx.drawImage(image, cx, lineO, width, lineH)
  advanceSpriteFrame(sprite, state.runtime.dt)

  if (state.render.drawMap) {
    drawSpriteTracer(entity, state)
  }
}

export function drawSpriteEntity2D(entity: Entity, state: GameState) {
  if (!state.render.drawMap || ('collected' in entity && entity.collected)) return

  const { minimap = {} } = entity.sprite ?? {}
  const ctx = state.render.mapCtx

  if (minimap.fillStyle) {
    ctx.fillStyle = minimap.fillStyle
    ctx.fillRect(entity.x - entity.size, entity.y - entity.size, entity.size * 2, entity.size * 2)
    ctx.strokeStyle = minimap.strokeStyle ?? 'green'
    ctx.lineWidth = 1
    ctx.strokeRect(entity.x - entity.size, entity.y - entity.size, entity.size * 2, entity.size * 2)
    return
  }

  ctx.beginPath()
  ctx.moveTo(entity.x - entity.size, entity.y - entity.size)
  ctx.lineTo(entity.x + entity.size, entity.y - entity.size)
  ctx.lineTo(entity.x + entity.size, entity.y + entity.size)
  ctx.lineTo(entity.x - entity.size, entity.y + entity.size)
  ctx.lineTo(entity.x - entity.size, entity.y - entity.size)
  ctx.strokeStyle = minimap.strokeStyle ?? 'green'
  ctx.lineWidth = 1
  ctx.stroke()
}

function drawSpriteTracer(entity: Entity, state: GameState) {
  const ctx = state.render.mapCtx
  const player = state.world.player

  ctx.strokeStyle = 'blue'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(entity.x + entity.size, entity.y - entity.size)
  ctx.lineTo(entity.x - entity.size, entity.y + entity.size)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(entity.x - entity.size, entity.y - entity.size)
  ctx.lineTo(entity.x + entity.size, entity.y + entity.size)
  ctx.stroke()

  ctx.beginPath()
  ctx.moveTo(player.x, player.y)
  ctx.lineTo(entity.x, entity.y)
  ctx.strokeStyle = 'green'
  ctx.lineWidth = 5
  ctx.stroke()
}
