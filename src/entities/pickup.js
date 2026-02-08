import { Entity } from './entity.js'

export class Pickup extends Entity {
  constructor(x, y, size, src, pickupType) {
    super(x, y, size, src)
    this.pickupType = pickupType
    this.collected = false
  }

  draw(dt, player, ctx, mapCtx, view, options = {}) {
    super.draw(dt, player, ctx, mapCtx, view, {
      ...options,
      height: 0.45,
    })
  }

  draw2D(ctx, drawMap = false) {
    if (!drawMap || this.collected) return

    ctx.fillStyle = '#ff4444'
    ctx.fillRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1
    ctx.strokeRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2)
  }
}
