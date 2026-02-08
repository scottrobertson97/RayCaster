import {
  DOOR_CLOSE_DURATION,
  DOOR_HOLD_DURATION,
  DOOR_INTERACT_RANGE,
  DOOR_OPEN_DURATION,
  DOOR_OPEN_PASSABLE_THRESHOLD,
  DOOR_TILE_ID,
} from '../config/constants.js'
import { Keyboard } from '../input/keyboard-state.js'
import { GameMap } from '../map/game-map.js'

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

function ensureDoorTile(state, door, tileValue) {
  if (state.map[door.tileY][door.tileX] !== tileValue) {
    state.map.setTile(door.tileX, door.tileY, tileValue)
  }
}

function isDoorBlockedByActors(state, door) {
  const px = worldToTile(state.player.x)
  const py = worldToTile(state.player.y)
  if (px === door.tileX && py === door.tileY) {
    return true
  }

  return state.entityStore.enemies.some(enemy => {
    const ex = worldToTile(enemy.x)
    const ey = worldToTile(enemy.y)
    return ex === door.tileX && ey === door.tileY
  })
}

function getClosestDoorInFront(state) {
  const direction = { x: Math.cos(state.player.a), y: Math.sin(state.player.a) }
  const steps = 12
  const stepDistance = DOOR_INTERACT_RANGE / steps
  let closestDoor = null
  let closestDistance = Infinity

  for (let i = 1; i <= steps; i++) {
    const sampleX = state.player.x + direction.x * stepDistance * i
    const sampleY = state.player.y + direction.y * stepDistance * i
    const tileX = worldToTile(sampleX)
    const tileY = worldToTile(sampleY)
    if (tileY < 0 || tileY >= state.map.height || tileX < 0 || tileX >= state.map.width) {
      break
    }

    const sampledTile = state.map[tileY][tileX]
    if (sampledTile > 0 && sampledTile !== DOOR_TILE_ID) {
      break
    }

    const key = getDoorKey(tileX, tileY)
    const door = state.doors[key]
    if (!door) continue

    const centerX = tileX * GameMap.size + GameMap.size * 0.5
    const centerY = tileY * GameMap.size + GameMap.size * 0.5
    const dx = centerX - state.player.x
    const dy = centerY - state.player.y
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
  door.openAmount = Math.min(door.openAmount + state.dt / DOOR_OPEN_DURATION, 1)
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
  door.holdTimer -= state.dt
  if (door.holdTimer > 0) return

  if (isDoorBlockedByActors(state, door)) {
    door.holdTimer = DOOR_CLOSE_RETRY_DELAY
    return
  }

  ensureDoorTile(state, door, DOOR_TILE_ID)
  setDoorPhase(door, 'closing')
}

function updateDoorClosing(state, door) {
  ensureDoorTile(state, door, DOOR_TILE_ID)

  if (isDoorBlockedByActors(state, door)) {
    ensureDoorTile(state, door, 0)
    setDoorPhase(door, 'opening')
    return
  }

  door.openAmount = Math.max(door.openAmount - state.dt / DOOR_CLOSE_DURATION, 0)
  if (door.openAmount > EPSILON) {
    return
  }

  door.openAmount = 0
  setDoorPhase(door, 'closed')
}

export function initializeDoorsFromMap(state) {
  const doors = {}

  for (let y = 0; y < state.map.height; y++) {
    for (let x = 0; x < state.map.width; x++) {
      if (state.map[y][x] !== DOOR_TILE_ID) continue

      const key = getDoorKey(x, y)
      doors[key] = {
        tileX: x,
        tileY: y,
        phase: 'closed',
        openAmount: 0,
        holdTimer: 0,
      }
    }
  }

  state.doors = doors
}

export function handleDoorActivation(state) {
  const eDown = state.keyboard.keydown[Keyboard.KEYBOARD.KEY_E]
  const eWasDown = state.keyboard.previousKeydown[Keyboard.KEYBOARD.KEY_E]
  if (!eDown || eWasDown) return

  const targetDoor = getClosestDoorInFront(state)
  if (!targetDoor) return
  activateDoor(state, targetDoor)
}

export function updateDoors(state) {
  Object.values(state.doors).forEach(door => {
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

    ensureDoorTile(state, door, DOOR_TILE_ID)
  })
}
