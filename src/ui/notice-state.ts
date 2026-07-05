const DEFAULT_NOTICE_DURATION = 1.25

import type { GameState } from '../types.js'

export function clearUiNotice(state: GameState) {
  state.ui.notice.text = ''
  state.ui.notice.timer = 0
}

export function setUiNotice(state: GameState, text: string, duration = DEFAULT_NOTICE_DURATION) {
  state.ui.notice.text = text
  state.ui.notice.timer = duration
}

export function updateUiNotice(state: GameState) {
  if (state.ui.notice.timer <= 0) return

  state.ui.notice.timer -= state.runtime.dt
  if (state.ui.notice.timer <= 0) {
    clearUiNotice(state)
  }
}
