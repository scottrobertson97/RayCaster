import { ASSET_IDS } from '../assets/asset-manifest.js'
import { mapMatrix } from './map-matrix.js'

export const defaultLevel = {
  map: mapMatrix,
  playerStart: {
    x: 300,
    y: 300,
  },
  entities: [
    {
      type: 'enemy',
      x: 600,
      y: 450,
      size: 10,
      asset: ASSET_IDS.sprites.enemyGuard,
    },
    {
      type: 'enemy',
      x: 200,
      y: 700,
      size: 10,
      asset: [
        ASSET_IDS.sprites.enemyWalk1,
        ASSET_IDS.sprites.enemyWalk2,
        ASSET_IDS.sprites.enemyWalk3,
      ],
    },
    {
      type: 'sprite',
      x: 600,
      y: 750,
      size: 40,
      asset: ASSET_IDS.sprites.decoration,
    },
  ],
}
