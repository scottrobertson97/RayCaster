import { KEYCARD_RED_TILE_ID, KEY_RED } from '../config/constants.js'
import { Pickup } from '../entities/pickup.js'
import { GameMap } from '../map/game-map.js'

const PICKUP_RADIUS = GameMap.size * 0.35
const PICKUP_RADIUS_SQ = PICKUP_RADIUS * PICKUP_RADIUS
const DEFAULT_NOTICE_DURATION = 1.25

const RED_KEYCARD_SPRITE = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40">
    <rect x="1" y="1" width="62" height="38" rx="6" fill="#b61212" stroke="#ffe1e1" stroke-width="2"/>
    <rect x="9" y="9" width="22" height="8" rx="2" fill="#ffe1e1"/>
    <circle cx="49" cy="20" r="6" fill="#ffe1e1"/>
    <rect x="41" y="28" width="16" height="4" rx="2" fill="#ffe1e1"/>
  </svg>`
)}`

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
}

export function initializeKeycardsFromMap(state) {
  for (let y = 0; y < state.world.map.height; y++) {
    for (let x = 0; x < state.world.map.width; x++) {
      if (state.world.map[y][x] !== KEYCARD_RED_TILE_ID) continue

      const centerX = x * GameMap.size + GameMap.size * 0.5
      const centerY = y * GameMap.size + GameMap.size * 0.5
      state.entities.pickups.push(new Pickup(centerX, centerY, 10, RED_KEYCARD_SPRITE, KEY_RED))
      state.world.map.setTile(x, y, 0)
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
