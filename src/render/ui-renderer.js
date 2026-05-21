import {
  CROSSHAIR_LINE_WIDTH,
  CROSSHAIR_SPACE,
  CROSSHAIR_WIDTH,
  FONT_SIZE,
  FPS_UPDATE_INTERVAL,
  WORLD_HEIGHT_RATIO,
} from '../config/constants.js'

export function drawUI(state) {
  const uiTop = state.render.view.height * WORLD_HEIGHT_RATIO
  const hudFontSize = Math.min(FONT_SIZE, 20)
  const hudLineStep = hudFontSize + 4

  state.render.ctx.fillStyle = 'green'
  state.render.ctx.fillRect(0, uiTop, state.render.view.width, state.render.view.height * 0.25)

  state.render.ctx.beginPath()
  state.render.ctx.moveTo(state.render.view.width * 0.5, state.render.view.halfHeight * WORLD_HEIGHT_RATIO - CROSSHAIR_SPACE - CROSSHAIR_WIDTH)
  state.render.ctx.lineTo(state.render.view.width * 0.5, state.render.view.halfHeight * WORLD_HEIGHT_RATIO - CROSSHAIR_SPACE)

  state.render.ctx.moveTo(state.render.view.width * 0.5, state.render.view.halfHeight * WORLD_HEIGHT_RATIO + CROSSHAIR_SPACE + CROSSHAIR_WIDTH)
  state.render.ctx.lineTo(state.render.view.width * 0.5, state.render.view.halfHeight * WORLD_HEIGHT_RATIO + CROSSHAIR_SPACE)

  state.render.ctx.moveTo(state.render.view.width * 0.5 - CROSSHAIR_SPACE - CROSSHAIR_WIDTH, state.render.view.halfHeight * WORLD_HEIGHT_RATIO)
  state.render.ctx.lineTo(state.render.view.width * 0.5 - CROSSHAIR_SPACE, state.render.view.halfHeight * WORLD_HEIGHT_RATIO)

  state.render.ctx.moveTo(state.render.view.width * 0.5 + CROSSHAIR_SPACE + CROSSHAIR_WIDTH, state.render.view.halfHeight * WORLD_HEIGHT_RATIO)
  state.render.ctx.lineTo(state.render.view.width * 0.5 + CROSSHAIR_SPACE, state.render.view.halfHeight * WORLD_HEIGHT_RATIO)

  state.render.ctx.strokeStyle = 'green'
  state.render.ctx.lineWidth = CROSSHAIR_LINE_WIDTH
  state.render.ctx.stroke()

  state.render.ctx.fillStyle = 'black'
  state.render.ctx.font = `${hudFontSize}px Arial`
  state.render.ctx.fillText('WASD or Arrow Keys to move', 10, uiTop + hudLineStep * 1)
  state.render.ctx.fillText('SPACE to shoot', 10, uiTop + hudLineStep * 2)
  state.render.ctx.fillText('E to open/close doors', 10, uiTop + hudLineStep * 3)
  state.render.ctx.fillText('R/F to look up/down', 10, uiTop + hudLineStep * 4)
  state.render.ctx.fillText(
    `Red keycard: ${state.world.inventory.hasRedKeycard ? 'YES' : 'NO'}`,
    10,
    uiTop + hudLineStep * 5
  )

  if (state.ui.notice.timer > 0 && state.ui.notice.text) {
    state.render.ctx.fillStyle = '#aa0000'
    state.render.ctx.fillText(state.ui.notice.text, state.render.view.width * 0.45, uiTop + hudLineStep * 1)
    state.render.ctx.fillStyle = 'black'
  }

  state.ui.fpsCounterBuffer += state.runtime.dt
  if (state.ui.fpsCounterBuffer > FPS_UPDATE_INTERVAL) {
    state.ui.fpsCounterBuffer = 0
    state.ui.fpsLast = Math.trunc(1 / state.runtime.dt)
  }

  state.render.ctx.fillText(`${state.ui.fpsLast} fps`, 10, uiTop + hudLineStep * 6)
}
