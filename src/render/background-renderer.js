import { WORLD_HEIGHT_RATIO } from '../config/constants.js'

export function fillSceneBackground(state) {
  const worldHeight = state.view.height * WORLD_HEIGHT_RATIO
  const pitchOffsetPx = Math.tan(state.player.pitch) * (worldHeight * 0.5)
  const unclampedHorizonY = worldHeight * 0.5 + pitchOffsetPx
  const horizonY = Math.max(0, Math.min(worldHeight, unclampedHorizonY))

  if (horizonY > 0) {
    const skyGradient = state.ctx.createLinearGradient(0, 0, 0, horizonY)
    skyGradient.addColorStop(0, '#666')
    skyGradient.addColorStop(1, '#222')
    state.ctx.fillStyle = skyGradient
    state.ctx.fillRect(0, 0, state.view.width, horizonY)
  }

  if (horizonY < worldHeight) {
    const floorGradient = state.ctx.createLinearGradient(0, horizonY, 0, worldHeight)
    floorGradient.addColorStop(0, '#555')
    floorGradient.addColorStop(1, '#888')
    state.ctx.fillStyle = floorGradient
    state.ctx.fillRect(0, horizonY, state.view.width, worldHeight - horizonY)
  }
}
