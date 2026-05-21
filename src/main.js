import { ASSET_IDS } from './assets/asset-manifest.js'
import { walls } from './assets/textures.js'
import { mapMatrix } from './data/map-matrix.js'
import { Entity } from './entities/entity.js'
import { Enemy } from './entities/enemy.js'
import { Player } from './entities/player.js'
import { createRaycasterGame } from './engine/raycaster-game.js'
import { Keyboard } from './input/keyboard-state.js'
import { GameMap } from './map/game-map.js'

window.addEventListener('load', init)

function init() {
  const viewCanvas = document.getElementById('view')
  const mapCanvas = document.getElementById('map')

  const game = createRaycasterGame({
    viewCanvas,
    mapCanvas,
    map: new GameMap(mapMatrix),
    player: new Player(300, 300),
    keyboard: new Keyboard(),
    walls,
    entities: createInitialEntities(),
    controlsRoot: document,
  })

  game.start()
}

function createInitialEntities() {
  return {
    enemies: [
      new Enemy(600, 450, 10, ASSET_IDS.sprites.enemyGuard),
      new Enemy(200, 700, 10, [
        ASSET_IDS.sprites.enemyWalk1,
        ASSET_IDS.sprites.enemyWalk2,
        ASSET_IDS.sprites.enemyWalk3,
      ]),
      new Entity(600, 750, 40, ASSET_IDS.sprites.decoration),
    ],
  }
}
