import type { Entity } from '../entities/entity.js'

function hasSprite(entity: Entity) {
  return Boolean(entity.sprite)
}

export function isSpriteVisible(entity: Entity) {
  return Boolean(entity.sprite?.visible)
}

export function markSpriteVisible(entity: Entity) {
  if (hasSprite(entity)) {
    entity.sprite.visible = true
  }
}

export function resetSpriteVisibility(entities: Entity[]) {
  entities.forEach(entity => {
    if (hasSprite(entity)) {
      entity.sprite.visible = false
    }
  })
}
