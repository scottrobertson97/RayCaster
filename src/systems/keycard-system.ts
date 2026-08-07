import { KEY_GREEN, KEY_RED } from '../config/constants.js'
import type { Pickup } from '../entities/pickup.js'
import { GameMap } from '../map/game-map.js'
import { setUiNotice } from '../ui/notice-state.js'
import type { GameState } from '../types.js'

const PICKUP_RADIUS = GameMap.size * 0.35
const PICKUP_RADIUS_SQ = PICKUP_RADIUS * PICKUP_RADIUS

function collectPickup(state: GameState, pickup: Pickup) {
  if (pickup.collected) return
  pickup.collected = true

  if (pickup.pickupType === KEY_RED && !state.world.inventory.hasRedKeycard) {
    state.world.inventory.hasRedKeycard = true
    setUiNotice(state, 'Picked up red keycard', 1.5)
  }

  if (pickup.pickupType === KEY_GREEN && !state.world.inventory.hasGreenKeycard) {
    state.world.inventory.hasGreenKeycard = true
    setUiNotice(state, 'Picked up green keycard', 1.5)
  }
}

export function updateKeycardPickups(state: GameState) {
  for (let i = state.entities.pickups.length - 1; i >= 0; i--) {
    const pickup = state.entities.pickups[i]
    if (pickup.collected) {
      state.entities.pickups.splice(i, 1)
      continue
    }

    const dx = pickup.x - state.world.player.x
    const dy = pickup.y - state.world.player.y
    if (dx * dx + dy * dy <= PICKUP_RADIUS_SQ) {
      collectPickup(state, pickup)
      state.entities.pickups.splice(i, 1)
    }
  }
}
