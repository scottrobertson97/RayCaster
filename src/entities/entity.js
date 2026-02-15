import { dist } from '../math/geometry.js'
import { GameMap } from '../map/game-map.js'

export class Entity {
  constructor(x, y, size, src, frameRate = 0.5) {
    this.x = x
    this.y = y
    this.size = size
    this.drawn = false
    this.speed = 0.2
    this.frameIndex = 0
    this.frameRate = frameRate
    this.frameTick = 0

    if (Array.isArray(src)) {
      this.imgs = []
      this.imgRatios = []
      for (const srcURL of src) {
        const img = new Image()
        img.onload = () => {
          this.imgRatios.push(img.width / img.height)
        }
        img.crossOrigin = 'anonymous'
        img.src = srcURL
        this.imgs.push(img)
      }
    } else {
      this.img = new Image()
      this.img.onload = () => {
        this.imgRatio = this.img.width / this.img.height
      }
      this.img.crossOrigin = 'anonymous'
      this.img.src = src
    }
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

  draw(
    dt,
    player,
    ctx,
    mapCtx,
    view,
    { fov = 90, drawMap = false, height = 1, pitchOffset = 0 } = {}
  ) {
    if (!this.imgRatio && this.img) {
      this.imgRatio = this.img.width / this.img.height
    }

    const disT = dist(player.x, player.y, this.x, this.y)
    const minT = player.a - (fov / 2) * (Math.PI / 180)
    const maxT = player.a + (fov / 2) * (Math.PI / 180)
    const x = this.x - player.x
    const y = this.y - player.y

    let t = Math.atan(y / x)
    if (y < 0 && x > 0) {
      t += Math.PI * 2
    } else if ((y > 0 && x < 0) || (y < 0 && x < 0)) {
      t += Math.PI
    }
    const ca = player.a - t
    const correctedDistance = disT * Math.cos(ca)

    const lineH = Math.trunc((GameMap.size * view.height * height) / correctedDistance)
    const lineO = view.halfHeight * 0.75 - Math.trunc(lineH / 2) + pitchOffset

    if (drawMap) {
      this.drawTracerLine(mapCtx, player)
    }

    const imgRatio = this.img ? (this.imgRatio ?? 1) : (this.imgRatios[this.frameIndex] ?? 1)
    const width = lineH * imgRatio

    let percent = (t - minT) / (maxT - minT)
    if (minT < 0 && t > player.a + Math.PI) {
      percent = (t - minT - Math.PI * 2) / (maxT - minT)
    } else if (maxT > Math.PI * 2 && t < player.a - Math.PI) {
      percent = (t - minT + Math.PI * 2) / (maxT - minT)
    }
    const cx = percent * view.width - width / 2

    if (this.img) {
      ctx.drawImage(this.img, cx, lineO, width, lineH)
    } else if (this.imgs) {
      ctx.drawImage(this.imgs[this.frameIndex], cx, lineO, width, lineH)
      this.frameTick += dt
      if (this.frameTick > this.frameRate) {
        this.frameTick = 0
        this.frameIndex += 1
        if (this.frameIndex >= this.imgs.length) this.frameIndex = 0
      }
    }
  }

  draw2D(ctx, drawMap = false) {
    if (!drawMap) return

    ctx.beginPath()
    ctx.moveTo(this.x - this.size, this.y - this.size)
    ctx.lineTo(this.x + this.size, this.y - this.size)
    ctx.lineTo(this.x + this.size, this.y + this.size)
    ctx.lineTo(this.x - this.size, this.y + this.size)
    ctx.lineTo(this.x - this.size, this.y - this.size)
    ctx.strokeStyle = 'green'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  update(_player, _normFn, _map) {}

  drawTracerLine(mapCtx, player) {
    mapCtx.strokeStyle = 'blue'
    mapCtx.lineWidth = 5
    mapCtx.beginPath()
    mapCtx.moveTo(this.x + this.size, this.y - this.size)
    mapCtx.lineTo(this.x - this.size, this.y + this.size)
    mapCtx.stroke()

    mapCtx.beginPath()
    mapCtx.moveTo(this.x - this.size, this.y - this.size)
    mapCtx.lineTo(this.x + this.size, this.y + this.size)
    mapCtx.stroke()

    mapCtx.beginPath()
    mapCtx.moveTo(player.x, player.y)
    mapCtx.lineTo(this.x, this.y)
    mapCtx.strokeStyle = 'green'
    mapCtx.lineWidth = 5
    mapCtx.stroke()
  }
}
