import { walls } from './assets/textures.js'
import { defaultLevel } from './data/default-level.js'
import { createLevelRuntimeData } from './engine/level-loader.js'
import { createRaycasterGame } from './engine/raycaster-game.js'
import { Keyboard } from './input/keyboard-state.js'

window.addEventListener('load', init)

function init() {
  const viewCanvas = document.getElementById('view')
  const mapCanvas = document.getElementById('map')
  const level = createLevelRuntimeData(defaultLevel)

  const game = createRaycasterGame({
    viewCanvas,
    mapCanvas,
    map: level.map,
    player: level.player,
    keyboard: new Keyboard(),
    walls,
    entities: level.entities,
    controlsRoot: document,
  })

  game.start()
}
