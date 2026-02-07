export function calculateDeltaTime(state) {
  const now = performance.now()
  const lastTime = state.lastTime
  state.lastTime = now
  return (now - lastTime) / 1000
}

export function startFrameLoop(state, frameFn) {
  function frame() {
    state.dt = calculateDeltaTime(state)
    frameFn(state)
    state.keyboard.snapshot()
    requestAnimationFrame(frame)
  }

  frame()
}
