export function calculateDeltaTime(state) {
  const now = performance.now()
  const lastTime = state.runtime.lastTime
  state.runtime.lastTime = now
  return (now - lastTime) / 1000
}

export function startFrameLoop(state, frameFn) {
  let frameRequest = null
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
