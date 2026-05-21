import { Entity } from './entity.js'

export class Pickup extends Entity {
  constructor(x, y, size, src, pickupType) {
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
