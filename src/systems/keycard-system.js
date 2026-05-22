import { KEY_GREEN, KEY_RED } from '../config/constants.js'
import { getTileDefinition, isPickupSpawnTileId } from '../data/tile-definitions.js'
import { Pickup } from '../entities/pickup.js'
import { GameMap } from '../map/game-map.js'
import { tilePointCenter } from '../math/tile-coordinates.js'

const PICKUP_RADIUS = GameMap.size * 0.35
const PICKUP_RADIUS_SQ = PICKUP_RADIUS * PICKUP_RADIUS
const DEFAULT_NOTICE_DURATION = 1.25

function clearNotice(state) {
  state.ui.notice.text = ''
  state.ui.notice.timer = 0
}

function updateNoticeTimer(state) {
  if (state.ui.notice.timer <= 0) return
  state.ui.notice.timer -= state.runtime.dt
  if (state.ui.notice.timer <= 0) {
    clearNotice(state)
  }
}

export function setUiNotice(state, text, duration = DEFAULT_NOTICE_DURATION) {
  state.ui.notice.text = text
  state.ui.notice.timer = duration
}

function collectPickup(state, pickup) {
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

export function initializeKeycardsFromMap(state) {
  for (let y = 0; y < state.world.map.height; y++) {
    for (let x = 0; x < state.world.map.width; x++) {
      const tile = state.world.map[y][x]
      if (!isPickupSpawnTileId(tile)) continue

      const definition = getTileDefinition(tile)

      const { x: centerX, y: centerY } = tilePointCenter(x, y)
      state.entities.pickups.push(
        new Pickup(centerX, centerY, 10, definition.asset, definition.pickupType)
      )
      state.world.map.setTile(x, y, definition.clearTileId)
    }
  }
}

export function updateKeycardPickups(state) {
  updateNoticeTimer(state)

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
