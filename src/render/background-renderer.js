import { WORLD_HEIGHT_RATIO } from '../config/constants.js'

export function fillSceneBackground(state) {
  const worldHeight = state.render.view.height * WORLD_HEIGHT_RATIO
  const pitchOffsetPx = Math.tan(state.world.player.pitch) * (worldHeight * 0.5)
  const unclampedHorizonY = worldHeight * 0.5 + pitchOffsetPx
  const horizonY = Math.max(0, Math.min(worldHeight, unclampedHorizonY))

  if (horizonY > 0) {
    const skyGradient = state.render.ctx.createLinearGradient(0, 0, 0, horizonY)
    skyGradient.addColorStop(0, '#666')
    skyGradient.addColorStop(1, '#222')
    state.render.ctx.fillStyle = skyGradient
    state.render.ctx.fillRect(0, 0, state.render.view.width, horizonY)
  }

  if (horizonY < worldHeight) {
    const floorGradient = state.render.ctx.createLinearGradient(0, horizonY, 0, worldHeight)
    floorGradient.addColorStop(0, '#555')
    floorGradient.addColorStop(1, '#888')
    state.render.ctx.fillStyle = floorGradient
    state.render.ctx.fillRect(0, horizonY, state.render.view.width, worldHeight - horizonY)
  }
}
