import {
  CROSSHAIR_LINE_WIDTH,
  CROSSHAIR_SPACE,
  CROSSHAIR_WIDTH,
  DAMAGE_FLASH_DURATION,
  FONT_SIZE,
  HIT_MARKER_DURATION,
  HUD_HEIGHT_RATIO,
  WORLD_HEIGHT_RATIO,
} from '../config/constants.js'
import { updateFpsCounter } from '../ui/fps-counter.js'
import type { GameState } from '../types.js'

const HUD_BACKGROUND = '#245b35'
const HUD_TEXT = '#f4f1df'

export function drawUI(state: GameState) {
  const worldHeight = state.render.view.height * WORLD_HEIGHT_RATIO

  drawDamageFlash(state, worldHeight)
  drawHud(state, worldHeight)
  drawCrosshair(state, worldHeight)
  drawHitMarker(state, worldHeight)

  if (state.runtime.phase === 'gameOver') {
    drawGameOver(state)
  }
}

function drawDamageFlash(state: GameState, worldHeight: number) {
  if (state.ui.damageFlashTimer <= 0) return

  const strength = Math.min(1, state.ui.damageFlashTimer / DAMAGE_FLASH_DURATION)
  const ctx = state.render.ctx
  ctx.save()
  ctx.globalAlpha = strength * 0.42
  ctx.fillStyle = '#ff2020'
  ctx.fillRect(0, 0, state.render.view.width, worldHeight)
  ctx.restore()
}

function drawHud(state: GameState, hudTop: number) {
  const ctx = state.render.ctx
  const hudHeight = state.render.view.height * HUD_HEIGHT_RATIO
  const fontSize = Math.min(FONT_SIZE, 18)
  const lineStep = 22
  const firstLine = hudTop + 24
  const leftX = 12
  const rightX = Math.max(state.render.view.width * 0.52, 310)

  ctx.save()
  ctx.fillStyle = HUD_BACKGROUND
  ctx.fillRect(0, hudTop, state.render.view.width, hudHeight)

  ctx.fillStyle = HUD_TEXT
  ctx.font = `${fontSize}px Arial`
  ctx.fillText('WASD / Arrows: move and turn', leftX, firstLine)
  ctx.fillText('SPACE: fire', leftX, firstLine + lineStep)
  ctx.fillText('E: interact with doors', leftX, firstLine + lineStep * 2)
  ctx.fillText('R / F: look up and down', leftX, firstLine + lineStep * 3)
  ctx.fillText(
    `${updateFpsCounter(state)} fps`,
    leftX,
    hudTop + hudHeight - 12,
  )

  drawHealth(state, rightX, firstLine)
  ctx.fillStyle = HUD_TEXT
  ctx.fillText(
    `Red keycard: ${state.world.inventory.hasRedKeycard ? 'YES' : 'NO'}`,
    rightX,
    firstLine + 53,
  )
  ctx.fillText(
    `Green keycard: ${state.world.inventory.hasGreenKeycard ? 'YES' : 'NO'}`,
    rightX,
    firstLine + 75,
  )

  if (state.ui.notice.timer > 0 && state.ui.notice.text) {
    ctx.fillStyle = '#ffd36b'
    ctx.fillText(state.ui.notice.text, rightX, hudTop + hudHeight - 12)
  }
  ctx.restore()
}

function drawHealth(state: GameState, x: number, baseline: number) {
  const ctx = state.render.ctx
  const player = state.world.player
  const healthRatio = Math.max(0, Math.min(1, player.health / player.maxHealth))
  const barWidth = Math.max(
    100,
    Math.min(220, state.render.view.width - x - 16),
  )
  const barHeight = 18
  const barTop = baseline + 8

  ctx.fillStyle = HUD_TEXT
  ctx.fillText(`HEALTH ${player.health} / ${player.maxHealth}`, x, baseline)

  ctx.fillStyle = '#18251d'
  ctx.fillRect(x, barTop, barWidth, barHeight)
  ctx.fillStyle =
    healthRatio > 0.5 ? '#57d163' : healthRatio > 0.25 ? '#e4b94f' : '#dc4b43'
  ctx.fillRect(x, barTop, barWidth * healthRatio, barHeight)
  ctx.strokeStyle = HUD_TEXT
  ctx.lineWidth = 2
  ctx.strokeRect(x, barTop, barWidth, barHeight)
}

function drawCrosshair(state: GameState, worldHeight: number) {
  const ctx = state.render.ctx
  const centerX = state.render.view.width * 0.5
  const centerY = worldHeight * 0.5

  ctx.save()
  ctx.beginPath()
  ctx.moveTo(centerX, centerY - CROSSHAIR_SPACE - CROSSHAIR_WIDTH)
  ctx.lineTo(centerX, centerY - CROSSHAIR_SPACE)
  ctx.moveTo(centerX, centerY + CROSSHAIR_SPACE + CROSSHAIR_WIDTH)
  ctx.lineTo(centerX, centerY + CROSSHAIR_SPACE)
  ctx.moveTo(centerX - CROSSHAIR_SPACE - CROSSHAIR_WIDTH, centerY)
  ctx.lineTo(centerX - CROSSHAIR_SPACE, centerY)
  ctx.moveTo(centerX + CROSSHAIR_SPACE + CROSSHAIR_WIDTH, centerY)
  ctx.lineTo(centerX + CROSSHAIR_SPACE, centerY)
  ctx.strokeStyle = '#46e05f'
  ctx.lineWidth = CROSSHAIR_LINE_WIDTH
  ctx.stroke()
  ctx.restore()
}

function drawHitMarker(state: GameState, worldHeight: number) {
  if (state.ui.hitMarkerTimer <= 0) return

  const ctx = state.render.ctx
  const centerX = state.render.view.width * 0.5
  const centerY = worldHeight * 0.5
  const gap = 5
  const arm = 8

  ctx.save()
  ctx.globalAlpha = Math.min(1, state.ui.hitMarkerTimer / HIT_MARKER_DURATION)
  ctx.beginPath()
  ctx.moveTo(centerX - gap, centerY - gap)
  ctx.lineTo(centerX - gap - arm, centerY - gap - arm)
  ctx.moveTo(centerX + gap, centerY - gap)
  ctx.lineTo(centerX + gap + arm, centerY - gap - arm)
  ctx.moveTo(centerX - gap, centerY + gap)
  ctx.lineTo(centerX - gap - arm, centerY + gap + arm)
  ctx.moveTo(centerX + gap, centerY + gap)
  ctx.lineTo(centerX + gap + arm, centerY + gap + arm)
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.restore()
}

function drawGameOver(state: GameState) {
  const ctx = state.render.ctx
  const centerX = state.render.view.width * 0.5
  const centerY = state.render.view.height * 0.5

  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.74)'
  ctx.fillRect(0, 0, state.render.view.width, state.render.view.height)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#ef4f4f'
  ctx.font = 'bold 56px Arial'
  ctx.fillText('GAME OVER', centerX, centerY - 28)
  ctx.fillStyle = '#ffffff'
  ctx.font = '24px Arial'
  ctx.fillText('Press ENTER to restart', centerX, centerY + 34)
  ctx.restore()
}
