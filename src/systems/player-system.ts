import type { Bullet } from '../entities/bullet.js'
import type { GameState } from '../types.js'

export function updatePlayer(state: GameState) {
  state.world.player.update(state.runtime.dt, state.input.keyboard, state.world.map, bullet => {
    state.entities.bullets.push(bullet as Bullet)
  })
}
