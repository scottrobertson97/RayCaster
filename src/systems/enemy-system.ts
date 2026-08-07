import { DAMAGE_FLASH_DURATION } from '../config/constants.js'
import type { GameState } from '../types.js'

export function updateEnemies(state: GameState) {
  for (const enemy of state.entities.enemies) {
    const playerWasHit = enemy.update(
      state.runtime.dt,
      state.world.player,
      state.world.map,
    )
    if (!playerWasHit) continue

    state.ui.damageFlashTimer = DAMAGE_FLASH_DURATION
    if (!state.world.player.isAlive) {
      state.runtime.phase = 'gameOver'
      break
    }
  }
}
