import { ASSET_IDS } from '../assets/asset-manifest.js'
import { KEY_GREEN, KEY_RED } from '../config/constants.js'
import { mapMatrix } from './map-matrix.js'
import type { LevelDefinition } from '../types.js'

export const defaultLevel = {
  map: mapMatrix,
  playerStart: {
    x: 288,
    y: 288,
  },
  entities: [
    {
      type: 'enemy',
      x: 608,
      y: 480,
      size: 10,
      asset: ASSET_IDS.sprites.enemyGuard,
    },
    {
      type: 'enemy',
      x: 224,
      y: 672,
      size: 10,
      asset: [
        ASSET_IDS.sprites.enemyWalk1,
        ASSET_IDS.sprites.enemyWalk2,
        ASSET_IDS.sprites.enemyWalk3,
      ],
    },
    {
      type: 'sprite',
      x: 608,
      y: 736,
      size: 40,
      asset: ASSET_IDS.sprites.decoration,
    },
    {
      type: 'pickup',
      x: 608,
      y: 352,
      size: 10,
      asset: ASSET_IDS.sprites.redKeycard,
      pickupType: KEY_RED,
    },
    {
      type: 'pickup',
      x: 608,
      y: 224,
      size: 10,
      asset: ASSET_IDS.sprites.greenKeycard,
      pickupType: KEY_GREEN,
    },
  ],
} satisfies LevelDefinition
