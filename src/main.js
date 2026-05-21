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
      new Enemy(600, 450, 10, 'https://i.imgur.com/FcIXhVp.png'),
      new Enemy(200, 700, 10, [
        'https://i.imgur.com/rAFkpSc.png',
        'https://i.imgur.com/rYCrqax.png',
        'https://i.imgur.com/p5w5cCU.png',
      ]),
      new Entity(600, 750, 40, 'https://i.imgur.com/rgwwS0K.png'),
    ],
  }
}
