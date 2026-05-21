import {
  DOOR_CLOSE_DURATION,
  DOOR_HOLD_DURATION,
  DOOR_INTERACT_RANGE,
  DOOR_LOCKED_RED_TILE_ID,
  DOOR_OPEN_DURATION,
  DOOR_OPEN_PASSABLE_THRESHOLD,
  DOOR_UNLOCKED_TILE_ID,
  KEY_RED,
} from '../config/constants.js'
import { GameMap } from '../map/game-map.js'
import { setUiNotice } from './keycard-system.js'

const DOOR_CLOSE_RETRY_DELAY = 0.15
const EPSILON = 0.000001

function getDoorKey(tileX, tileY) {
  return `${tileX},${tileY}`
}

function worldToTile(value) {
  return Math.trunc(value) >> 6
}

function setDoorPhase(door, phase) {
  door.phase = phase
}

function isDoorTile(tile) {
  return tile === DOOR_UNLOCKED_TILE_ID || tile === DOOR_LOCKED_RED_TILE_ID
}

function getClosedDoorTile(door) {
  return door.locked ? DOOR_LOCKED_RED_TILE_ID : DOOR_UNLOCKED_TILE_ID
}

function hasRequiredKey(state, door) {
  if (!door.requiredKey) return true
  if (door.requiredKey === KEY_RED) return state.world.inventory.hasRedKeycard
  return false
}

function tryUnlockDoor(state, door) {
  if (!door.locked) return true
  if (!hasRequiredKey(state, door)) {
    if (door.requiredKey === KEY_RED) {
      setUiNotice(state, 'Red keycard required')
    }
    return false
  }

  door.locked = false
  door.requiredKey = null
  ensureDoorTile(state, door, DOOR_UNLOCKED_TILE_ID)
  return true
}

function ensureDoorTile(state, door, tileValue) {
  if (state.world.map[door.tileY][door.tileX] !== tileValue) {
    state.world.map.setTile(door.tileX, door.tileY, tileValue)
  }
}

function isDoorBlockedByActors(state, door) {
  const px = worldToTile(state.world.player.x)
  const py = worldToTile(state.world.player.y)
  if (px === door.tileX && py === door.tileY) {
    return true
  }

  return state.entities.enemies.some(enemy => {
    const ex = worldToTile(enemy.x)
    const ey = worldToTile(enemy.y)
    return ex === door.tileX && ey === door.tileY
  })
}

function getClosestDoorInFront(state) {
  const direction = { x: Math.cos(state.world.player.a), y: Math.sin(state.world.player.a) }
  const steps = 12
  const stepDistance = DOOR_INTERACT_RANGE / steps
  let closestDoor = null
  let closestDistance = Infinity

  for (let i = 1; i <= steps; i++) {
    const sampleX = state.world.player.x + direction.x * stepDistance * i
    const sampleY = state.world.player.y + direction.y * stepDistance * i
    const tileX = worldToTile(sampleX)
    const tileY = worldToTile(sampleY)
    if (tileY < 0 || tileY >= state.world.map.height || tileX < 0 || tileX >= state.world.map.width) {
      break
    }

    const sampledTile = state.world.map[tileY][tileX]
    if (sampledTile > 0 && !isDoorTile(sampledTile)) {
      break
    }

    const key = getDoorKey(tileX, tileY)
    const door = state.world.doors[key]
    if (!door) continue

    const centerX = tileX * GameMap.size + GameMap.size * 0.5
    const centerY = tileY * GameMap.size + GameMap.size * 0.5
    const dx = centerX - state.world.player.x
    const dy = centerY - state.world.player.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance > DOOR_INTERACT_RANGE) continue

    if (distance < closestDistance) {
      closestDoor = door
      closestDistance = distance
    }
  }

  return closestDoor
}

function activateDoor(state, door) {
  if (!tryUnlockDoor(state, door)) return
  if (door.phase === 'opening') return

  if (door.phase === 'closing') {
    setDoorPhase(door, 'opening')
    ensureDoorTile(state, door, 0)
    return
  }

  if (door.phase === 'open') {
    door.holdTimer = DOOR_HOLD_DURATION
    return
  }

  setDoorPhase(door, 'opening')
}

function updateDoorOpening(state, door) {
  door.openAmount = Math.min(door.openAmount + state.runtime.dt / DOOR_OPEN_DURATION, 1)
  if (door.openAmount < DOOR_OPEN_PASSABLE_THRESHOLD - EPSILON) {
    return
  }

  ensureDoorTile(state, door, 0)
  door.openAmount = 1
  door.holdTimer = DOOR_HOLD_DURATION
  setDoorPhase(door, 'open')
}

function updateDoorOpen(state, door) {
  ensureDoorTile(state, door, 0)
  door.holdTimer -= state.runtime.dt
  if (door.holdTimer > 0) return

  if (isDoorBlockedByActors(state, door)) {
    door.holdTimer = DOOR_CLOSE_RETRY_DELAY
    return
  }

  ensureDoorTile(state, door, getClosedDoorTile(door))
  setDoorPhase(door, 'closing')
}

function updateDoorClosing(state, door) {
  ensureDoorTile(state, door, getClosedDoorTile(door))

  if (isDoorBlockedByActors(state, door)) {
    ensureDoorTile(state, door, 0)
    setDoorPhase(door, 'opening')
    return
  }

  door.openAmount = Math.max(door.openAmount - state.runtime.dt / DOOR_CLOSE_DURATION, 0)
  if (door.openAmount > EPSILON) {
    return
  }

  door.openAmount = 0
  setDoorPhase(door, 'closed')
}

export function initializeDoorsFromMap(state) {
  const doors = {}

  for (let y = 0; y < state.world.map.height; y++) {
    for (let x = 0; x < state.world.map.width; x++) {
      const tile = state.world.map[y][x]
      if (!isDoorTile(tile)) continue

      const key = getDoorKey(x, y)
      doors[key] = {
        tileX: x,
        tileY: y,
        locked: tile === DOOR_LOCKED_RED_TILE_ID,
        requiredKey: tile === DOOR_LOCKED_RED_TILE_ID ? KEY_RED : null,
        phase: 'closed',
        openAmount: 0,
        holdTimer: 0,
      }
    }
  }

  state.world.doors = doors
}

export function handleDoorActivation(state) {
  if (!state.input.keyboard.actionPressed('interact')) return

  const targetDoor = getClosestDoorInFront(state)
  if (!targetDoor) return
  activateDoor(state, targetDoor)
}

export function updateDoors(state) {
  Object.values(state.world.doors).forEach(door => {
    if (door.phase === 'opening') {
      updateDoorOpening(state, door)
      return
    }

    if (door.phase === 'open') {
      updateDoorOpen(state, door)
      return
    }

    if (door.phase === 'closing') {
      updateDoorClosing(state, door)
      return
    }

    ensureDoorTile(state, door, getClosedDoorTile(door))
  })
}
