import { FPS_UPDATE_INTERVAL } from '../config/constants.js'
import type { GameState } from '../types.js'

export function updateFpsCounter(state: GameState) {
  state.ui.fpsCounterBuffer += state.runtime.dt
  if (state.ui.fpsCounterBuffer > FPS_UPDATE_INTERVAL) {
    state.ui.fpsCounterBuffer = 0
    state.ui.fpsLast = Math.trunc(1 / state.runtime.dt)
  }

  return state.ui.fpsLast
}
