const DEFAULT_NOTICE_DURATION = 1.25

export function clearUiNotice(state) {
  state.ui.notice.text = ''
  state.ui.notice.timer = 0
}

export function setUiNotice(state, text, duration = DEFAULT_NOTICE_DURATION) {
  state.ui.notice.text = text
  state.ui.notice.timer = duration
}

export function updateUiNotice(state) {
  if (state.ui.notice.timer <= 0) return

  state.ui.notice.timer -= state.runtime.dt
  if (state.ui.notice.timer <= 0) {
    clearUiNotice(state)
  }
}
