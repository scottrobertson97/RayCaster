import { updateUiNotice } from '../ui/notice-state.js'
import type { GameState } from '../types.js'

export function updateGameSession(state: GameState) {
  updateUiNotice(state)
  state.ui.damageFlashTimer = tickTimer(state.ui.damageFlashTimer, state.runtime.dt)
  state.ui.hitMarkerTimer = tickTimer(state.ui.hitMarkerTimer, state.runtime.dt)

  if (
    state.runtime.phase === 'gameOver' &&
    state.input.keyboard.actionPressed('restart')
  ) {
    state.runtime.restartRequested = true
  }
}

function tickTimer(timer: number, dt: number) {
  return Math.max(0, timer - dt)
}
