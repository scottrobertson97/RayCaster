function hasSprite(entity) {
  return Boolean(entity.sprite)
}

export function isSpriteVisible(entity) {
  return Boolean(entity.sprite?.visible)
}

export function markSpriteVisible(entity) {
  if (hasSprite(entity)) {
    entity.sprite.visible = true
  }
}

export function resetSpriteVisibility(entities) {
  entities.forEach(entity => {
    if (hasSprite(entity)) {
      entity.sprite.visible = false
    }
  })
}
