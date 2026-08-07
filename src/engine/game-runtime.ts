import { calculateDeltaTime } from '../systems/frame-loop.js'
import type { GameState, System } from '../types.js'

type GameRuntimeOptions = {
  state: GameState
  alwaysUpdateSystems?: System[]
  updateSystems?: System[]
  renderSystems?: System[]
  resetState?: (state: GameState) => void
}

export class GameRuntime {
  state: GameState
  alwaysUpdateSystems: System[]
  updateSystems: System[]
  renderSystems: System[]
  resetState: ((state: GameState) => void) | undefined
  running: boolean
  frameRequest: number | null

  constructor({
    state,
    alwaysUpdateSystems = [],
    updateSystems = [],
    renderSystems = [],
    resetState,
  }: GameRuntimeOptions) {
    this.state = state
    this.alwaysUpdateSystems = alwaysUpdateSystems
    this.updateSystems = updateSystems
    this.renderSystems = renderSystems
    this.resetState = resetState
    this.running = false
    this.frameRequest = null
  }

  start() {
    if (this.running) return

    this.state.runtime.lastTime = performance.now()
    this.running = true
    this.frame()
  }

  stop() {
    this.running = false

    if (this.frameRequest !== null) {
      cancelAnimationFrame(this.frameRequest)
      this.frameRequest = null
    }
  }

  update() {
    runSystems(this.alwaysUpdateSystems, this.state)
    if (this.state.runtime.phase !== 'playing') return
    runSystems(this.updateSystems, this.state)
  }

  restart() {
    this.state.runtime.restartRequested = false
    if (!this.resetState) return false

    this.resetState(this.state)
    return true
  }

  render() {
    runSystems(this.renderSystems, this.state)
  }

  frame() {
    if (!this.running) return

    this.state.runtime.dt = calculateDeltaTime(this.state)
    this.update()
    if (this.state.runtime.restartRequested) {
      this.restart()
    }
    this.render()
    this.state.input.keyboard.snapshot()

    if (this.running) {
      this.frameRequest = requestAnimationFrame(() => this.frame())
    }
  }
}

function runSystems(systems: System[], state: GameState) {
  systems.forEach(system => system.run(state))
}
