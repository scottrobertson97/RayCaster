import { WorldObject } from './world-object.js'
import type { AssetRef, Point, SpriteDescriptor, SpriteOptions } from '../types.js'

export class Entity extends WorldObject {
  size: number
  speed: number
  sprite: SpriteDescriptor

  constructor(
    x: number,
    y: number,
    size: number,
    assetRef: AssetRef | AssetRef[],
    frameRate = 0.5,
    spriteOptions: SpriteOptions = {},
  ) {
    super(x, y)
    this.size = size
    this.speed = 0.2
    this.sprite = createSpriteDescriptor(assetRef, frameRate, spriteOptions)
  }

  get max(): Point {
    return { x: this.x + this.size, y: this.y + this.size }
  }

  get min(): Point {
    return { x: this.x - this.size, y: this.y - this.size }
  }

  update(_player: unknown, _normFn: unknown, _map: unknown) {}
}

function createSpriteDescriptor(
  assetRef: AssetRef | AssetRef[],
  frameRate: number,
  options: SpriteOptions,
): SpriteDescriptor {
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
