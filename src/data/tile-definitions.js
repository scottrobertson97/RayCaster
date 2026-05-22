import { ASSET_IDS } from '../assets/asset-manifest.js'
import {
  DOOR_LOCKED_RED_TILE_ID,
  DOOR_UNLOCKED_TILE_ID,
  KEY_RED,
  KEYCARD_RED_TILE_ID,
} from '../config/constants.js'

export const TILE_IDS = {
  empty: 0,
  stoneWall: 1,
  metalWall: 2,
  unlockedDoor: DOOR_UNLOCKED_TILE_ID,
  lockedRedDoor: DOOR_LOCKED_RED_TILE_ID,
  redKeycardSpawn: KEYCARD_RED_TILE_ID,
}

export const tileDefinitions = {
  [TILE_IDS.empty]: {
    id: TILE_IDS.empty,
    type: 'empty',
    solid: false,
  },
  [TILE_IDS.stoneWall]: {
    id: TILE_IDS.stoneWall,
    type: 'wall',
    solid: true,
    texture: ASSET_IDS.walls.stone,
  },
  [TILE_IDS.metalWall]: {
    id: TILE_IDS.metalWall,
    type: 'wall',
    solid: true,
    texture: ASSET_IDS.walls.metal,
  },
  [TILE_IDS.unlockedDoor]: {
    id: TILE_IDS.unlockedDoor,
    type: 'door',
    solid: true,
    locked: false,
    closedTileId: TILE_IDS.unlockedDoor,
    unlockedTileId: TILE_IDS.unlockedDoor,
  },
  [TILE_IDS.lockedRedDoor]: {
    id: TILE_IDS.lockedRedDoor,
    type: 'door',
    solid: true,
    locked: true,
    requiredKey: KEY_RED,
    closedTileId: TILE_IDS.lockedRedDoor,
    unlockedTileId: TILE_IDS.unlockedDoor,
  },
  [TILE_IDS.redKeycardSpawn]: {
    id: TILE_IDS.redKeycardSpawn,
    type: 'pickupSpawn',
    solid: false,
    pickupType: KEY_RED,
    asset: ASSET_IDS.sprites.redKeycard,
    clearTileId: TILE_IDS.empty,
  },
}

export function getTileDefinition(tileId) {
  return tileDefinitions[tileId] ?? {
    id: tileId,
    type: 'unknownSolid',
    solid: tileId > 0,
  }
}

export function isSolidTileId(tileId) {
  return getTileDefinition(tileId).solid
}

export function isDoorTileId(tileId) {
  return getTileDefinition(tileId).type === 'door'
}

export function isPickupSpawnTileId(tileId) {
  return getTileDefinition(tileId).type === 'pickupSpawn'
}
