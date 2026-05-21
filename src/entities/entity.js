export class Entity {
  constructor(x, y, size, assetRef, frameRate = 0.5, spriteOptions = {}) {
    this.x = x
    this.y = y
    this.size = size
    this.speed = 0.2
    this.sprite = createSpriteDescriptor(assetRef, frameRate, spriteOptions)
  }

  get max() {
    return { x: this.x + this.size, y: this.y + this.size }
  }

  get min() {
    return { x: this.x - this.size, y: this.y - this.size }
  }

  get point() {
    return { x: this.x, y: this.y }
  }

  update(_player, _normFn, _map) {}
}

function createSpriteDescriptor(assetRef, frameRate, options) {
  return {
    assetRefs: Array.isArray(assetRef) ? assetRef : [assetRef],
    frameIndex: 0,
    frameRate,
    frameTick: 0,
    height: options.height ?? 1,
    visible: false,
    minimap: options.minimap ?? { strokeStyle: 'green' },
  }
}
