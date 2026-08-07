import { walls } from './assets/textures.js'
import { defaultLevel } from './data/default-level.js'
import { createLevelRuntimeData } from './engine/level-loader.js'
import { createRaycasterGame } from './engine/raycaster-game.js'
import { Keyboard } from './input/keyboard-state.js'

window.addEventListener('load', init)

function init() {
  const viewCanvas = document.getElementById('view')
  const mapCanvas = document.getElementById('map')
  if (!(viewCanvas instanceof HTMLCanvasElement) || !(mapCanvas instanceof HTMLCanvasElement)) {
    throw new Error('RayCaster requires #view and #map canvas elements')
  }
  const resetLevel = () => createLevelRuntimeData(defaultLevel)
  const level = resetLevel()

  const game = createRaycasterGame({
    viewCanvas,
    mapCanvas,
    map: level.map,
    player: level.player,
    keyboard: new Keyboard(),
    walls,
    entities: level.entities,
    resetLevel,
    controlsRoot: document,
  })

  game.start()
}
