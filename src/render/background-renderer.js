import { WORLD_HEIGHT_RATIO } from '../config/constants.js'

export function fillSceneBackground(state) {
  const gradient = state.ctx.createLinearGradient(0, 0, 0, state.view.height * WORLD_HEIGHT_RATIO)
  gradient.addColorStop(0, '#555')
  gradient.addColorStop(0.4, '#222')
  gradient.addColorStop(0.5, '#222')
  gradient.addColorStop(0.5, '#555')
  gradient.addColorStop(0.6, '#555')
  gradient.addColorStop(1, '#888')

  state.ctx.fillStyle = gradient
  state.ctx.fillRect(0, 0, state.view.width, state.view.height * WORLD_HEIGHT_RATIO)
}
