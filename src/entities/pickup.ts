import { Entity } from './entity.js'
import type { AssetRef, KeyType } from '../types.js'

export class Pickup extends Entity {
  pickupType: KeyType
  collected: boolean

  constructor(x: number, y: number, size: number, src: AssetRef, pickupType: KeyType) {
    super(x, y, size, src, 0.5, {
      height: 0.45,
      minimap: {
        fillStyle: '#ff4444',
        strokeStyle: '#ffffff',
      },
    })
    this.pickupType = pickupType
    this.collected = false
  }
}
