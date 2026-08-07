import type { GameState } from '../types.js'

const MAX_FRAME_DELTA_SECONDS = 0.05

export function calculateDeltaTime(state: GameState) {
  const now = performance.now()
  const lastTime = state.runtime.lastTime
  state.runtime.lastTime = now

  if (lastTime <= 0) return 0
  const elapsed = (now - lastTime) / 1000
  return Math.min(MAX_FRAME_DELTA_SECONDS, Math.max(0, elapsed))
}

export function startFrameLoop(state: GameState, frameFn: (state: GameState) => void) {
  let frameRequest: number | null = null
  let running = true

  function frame() {
    if (!running) return

    state.runtime.dt = calculateDeltaTime(state)
    frameFn(state)
    state.input.keyboard.snapshot()
    frameRequest = requestAnimationFrame(frame)
  }

  frame()

  return {
    stop() {
      running = false
      if (frameRequest !== null) {
        cancelAnimationFrame(frameRequest)
        frameRequest = null
      }
    },
  }
}
