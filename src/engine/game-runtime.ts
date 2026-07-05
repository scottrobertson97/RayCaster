import { calculateDeltaTime } from '../systems/frame-loop.js'
import type { GameState, System } from '../types.js'

type GameRuntimeOptions = {
  state: GameState
  updateSystems?: System[]
  renderSystems?: System[]
}

export class GameRuntime {
  state: GameState
  updateSystems: System[]
  renderSystems: System[]
  running: boolean
  frameRequest: number | null

  constructor({ state, updateSystems = [], renderSystems = [] }: GameRuntimeOptions) {
    this.state = state
    this.updateSystems = updateSystems
    this.renderSystems = renderSystems
    this.running = false
    this.frameRequest = null
  }

  start() {
    if (this.running) return

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
    runSystems(this.updateSystems, this.state)
  }

  render() {
    runSystems(this.renderSystems, this.state)
  }

  frame() {
    if (!this.running) return

    this.state.runtime.dt = calculateDeltaTime(this.state)
    this.update()
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
