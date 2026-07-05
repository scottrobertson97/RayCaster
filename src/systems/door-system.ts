import {
  DOOR_CLOSE_DURATION,
  DOOR_HOLD_DURATION,
  DOOR_INTERACT_RANGE,
  DOOR_OPEN_DURATION,
  DOOR_OPEN_PASSABLE_THRESHOLD,
  DOOR_UNLOCKED_TILE_ID,
  KEY_GREEN,
  KEY_RED,
} from '../config/constants.js'
import { getTileDefinition, isDoorTileId, isSolidTileId } from '../data/tile-definitions.js'
import { getTileKey, isTileInBounds, tilePointCenter, worldToTile } from '../math/tile-coordinates.js'
import { setUiNotice } from '../ui/notice-state.js'
import type { DoorPhase, DoorState, GameState } from '../types.js'

const DOOR_CLOSE_RETRY_DELAY = 0.15
const EPSILON = 0.000001

// Door tiles are static spawn metadata; runtime door state lives in state.world.doors.
// The map tile is toggled between the closed tile and 0 so existing collision and raycast systems keep working.
export function getDoorAtTile(state: GameState, tileX: number, tileY: number): DoorState | null {
  return state.world.doors?.[getTileKey(tileX, tileY)] ?? null
}

export function getDoorOpenAmount(door: DoorState | null) {
  return door?.openAmount ?? 0
}

export function shouldRenderThroughDoor(door: DoorState | null, wallSamplePercent: number) {
  return Boolean(door) && getDoorOpenAmount(door) > EPSILON && wallSamplePercent < getDoorOpenAmount(door)
}

function setDoorPhase(door: DoorState, phase: DoorPhase) {
  door.phase = phase
}

function setDoorHoldTimer(door: DoorState, duration: number) {
  door.holdTimer = duration
}

function tickDoorHoldTimer(state: GameState, door: DoorState) {
  door.holdTimer -= state.runtime.dt
}

function setDoorOpenAmount(door: DoorState, openAmount: number) {
  door.openAmount = openAmount
}

function openDoorByDelta(state: GameState, door: DoorState) {
  setDoorOpenAmount(door, Math.min(door.openAmount + state.runtime.dt / DOOR_OPEN_DURATION, 1))
}

function closeDoorByDelta(state: GameState, door: DoorState) {
  setDoorOpenAmount(door, Math.max(door.openAmount - state.runtime.dt / DOOR_CLOSE_DURATION, 0))
}

function unlockDoor(state: GameState, door: DoorState) {
  door.locked = false
  door.requiredKey = null
  door.closedTileId = DOOR_UNLOCKED_TILE_ID
  setDoorCollisionTile(state, door, DOOR_UNLOCKED_TILE_ID)
}

function getClosedDoorTile(door: DoorState) {
  return door.closedTileId
}

function hasRequiredKey(state: GameState, door: DoorState) {
  if (!door.requiredKey) return true
  if (door.requiredKey === KEY_RED) return state.world.inventory.hasRedKeycard
  if (door.requiredKey === KEY_GREEN) return state.world.inventory.hasGreenKeycard
  return false
}

function tryUnlockDoor(state: GameState, door: DoorState) {
  if (!door.locked) return true
  if (!hasRequiredKey(state, door)) {
    if (door.requiredKey === KEY_RED) {
      setUiNotice(state, 'Red keycard required')
    }
    if (door.requiredKey === KEY_GREEN) {
      setUiNotice(state, 'Green keycard required')
    }
    return false
  }

  unlockDoor(state, door)
  return true
}

function setDoorCollisionTile(state: GameState, door: DoorState, tileValue: number) {
  if (state.world.map[door.tileY][door.tileX] !== tileValue) {
    state.world.map.setTile(door.tileX, door.tileY, tileValue)
  }
}

function isDoorBlockedByActors(state: GameState, door: DoorState) {
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

function getClosestDoorInFront(state: GameState): DoorState | null {
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
    if (!isTileInBounds(state.world.map, tileX, tileY)) {
      break
    }

    const sampledTile = state.world.map[tileY][tileX]
    if (isSolidTileId(sampledTile) && !isDoorTileId(sampledTile)) {
      break
    }

    const door = getDoorAtTile(state, tileX, tileY)
    if (!door) continue

    const { x: centerX, y: centerY } = tilePointCenter(tileX, tileY)
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

function activateDoor(state: GameState, door: DoorState) {
  if (!tryUnlockDoor(state, door)) return
  if (door.phase === 'opening') return

  if (door.phase === 'closing') {
    setDoorPhase(door, 'opening')
    setDoorCollisionTile(state, door, 0)
    return
  }

  if (door.phase === 'open') {
    setDoorHoldTimer(door, DOOR_HOLD_DURATION)
    return
  }

  setDoorPhase(door, 'opening')
}

function updateDoorOpening(state: GameState, door: DoorState) {
  openDoorByDelta(state, door)
  if (door.openAmount < DOOR_OPEN_PASSABLE_THRESHOLD - EPSILON) {
    return
  }

  setDoorCollisionTile(state, door, 0)
  setDoorOpenAmount(door, 1)
  setDoorHoldTimer(door, DOOR_HOLD_DURATION)
  setDoorPhase(door, 'open')
}

function updateDoorOpen(state: GameState, door: DoorState) {
  setDoorCollisionTile(state, door, 0)
  tickDoorHoldTimer(state, door)
  if (door.holdTimer > 0) return

  if (isDoorBlockedByActors(state, door)) {
    setDoorHoldTimer(door, DOOR_CLOSE_RETRY_DELAY)
    return
  }

  setDoorCollisionTile(state, door, getClosedDoorTile(door))
  setDoorPhase(door, 'closing')
}

function updateDoorClosing(state: GameState, door: DoorState) {
  setDoorCollisionTile(state, door, getClosedDoorTile(door))

  if (isDoorBlockedByActors(state, door)) {
    setDoorCollisionTile(state, door, 0)
    setDoorPhase(door, 'opening')
    return
  }

  closeDoorByDelta(state, door)
  if (door.openAmount > EPSILON) {
    return
  }

  setDoorOpenAmount(door, 0)
  setDoorPhase(door, 'closed')
}

export function initializeDoorsFromMap(state: GameState) {
  const doors: Record<string, DoorState> = {}

  for (let y = 0; y < state.world.map.height; y++) {
    for (let x = 0; x < state.world.map.width; x++) {
      const tile = state.world.map[y][x]
      if (!isDoorTileId(tile)) continue

      const definition = getTileDefinition(tile)

      const key = getTileKey(x, y)
      doors[key] = {
        tileX: x,
        tileY: y,
        locked: definition.locked ?? false,
        requiredKey: definition.requiredKey ?? null,
        closedTileId: definition.closedTileId ?? tile,
        phase: 'closed',
        openAmount: 0,
        holdTimer: 0,
      }
    }
  }

  state.world.doors = doors
}

export function handleDoorActivation(state: GameState) {
  if (!state.input.keyboard.actionPressed('interact')) return

  const targetDoor = getClosestDoorInFront(state)
  if (!targetDoor) return
  activateDoor(state, targetDoor)
}

export function updateDoors(state: GameState) {
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

    setDoorCollisionTile(state, door, getClosedDoorTile(door))
  })
}
