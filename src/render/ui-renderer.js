import {
  CROSSHAIR_LINE_WIDTH,
  CROSSHAIR_SPACE,
  CROSSHAIR_WIDTH,
  FONT_SIZE,
  FPS_UPDATE_INTERVAL,
  WORLD_HEIGHT_RATIO,
} from '../config/constants.js'

export function drawUI(state) {
  const uiTop = state.view.height * WORLD_HEIGHT_RATIO

  state.ctx.fillStyle = 'green'
  state.ctx.fillRect(0, uiTop, state.view.width, state.view.height * 0.25)

  state.ctx.beginPath()
  state.ctx.moveTo(state.view.width * 0.5, state.view.halfHeight * WORLD_HEIGHT_RATIO - CROSSHAIR_SPACE - CROSSHAIR_WIDTH)
  state.ctx.lineTo(state.view.width * 0.5, state.view.halfHeight * WORLD_HEIGHT_RATIO - CROSSHAIR_SPACE)

  state.ctx.moveTo(state.view.width * 0.5, state.view.halfHeight * WORLD_HEIGHT_RATIO + CROSSHAIR_SPACE + CROSSHAIR_WIDTH)
  state.ctx.lineTo(state.view.width * 0.5, state.view.halfHeight * WORLD_HEIGHT_RATIO + CROSSHAIR_SPACE)

  state.ctx.moveTo(state.view.width * 0.5 - CROSSHAIR_SPACE - CROSSHAIR_WIDTH, state.view.halfHeight * WORLD_HEIGHT_RATIO)
  state.ctx.lineTo(state.view.width * 0.5 - CROSSHAIR_SPACE, state.view.halfHeight * WORLD_HEIGHT_RATIO)

  state.ctx.moveTo(state.view.width * 0.5 + CROSSHAIR_SPACE + CROSSHAIR_WIDTH, state.view.halfHeight * WORLD_HEIGHT_RATIO)
  state.ctx.lineTo(state.view.width * 0.5 + CROSSHAIR_SPACE, state.view.halfHeight * WORLD_HEIGHT_RATIO)

  state.ctx.strokeStyle = 'green'
  state.ctx.lineWidth = CROSSHAIR_LINE_WIDTH
  state.ctx.stroke()

  state.ctx.fillStyle = 'black'
  state.ctx.font = `${FONT_SIZE}px Arial`
  state.ctx.fillText('WASD or Arrow Keys to move', 10, uiTop + FONT_SIZE + 5)
  state.ctx.fillText('SPACE to shoot', 10, uiTop + (FONT_SIZE + 5) * 2)
  state.ctx.fillText('E to open/close doors', 10, uiTop + (FONT_SIZE + 5) * 3)
  state.ctx.fillText(
    `Red keycard: ${state.inventory.hasRedKeycard ? 'YES' : 'NO'}`,
    10,
    uiTop + (FONT_SIZE + 5) * 4
  )

  if (state.uiNotice.timer > 0 && state.uiNotice.text) {
    state.ctx.fillStyle = '#aa0000'
    state.ctx.fillText(state.uiNotice.text, state.view.width * 0.45, uiTop + FONT_SIZE + 5)
    state.ctx.fillStyle = 'black'
  }

  state.fpsCounterBuffer += state.dt
  if (state.fpsCounterBuffer > FPS_UPDATE_INTERVAL) {
    state.fpsCounterBuffer = 0
    state.fpsLast = Math.trunc(1 / state.dt)
  }

  state.ctx.fillText(`${state.fpsLast} fps`, 10, uiTop + (FONT_SIZE + 5) * 5)
}
