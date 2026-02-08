import { walls } from './assets/textures.js'
import { mapMatrix } from './data/map-matrix.js'
import { Entity } from './entities/entity.js'
import { Enemy } from './entities/enemy.js'
import { Player } from './entities/player.js'
import { Keyboard } from './input/keyboard-state.js'
import { GameMap } from './map/game-map.js'
import { drawEntities2D, drawRaycastScene } from './render/entity-renderer.js'
import { drawUI } from './render/ui-renderer.js'
import { createGameState } from './state/game-state.js'
import { resolveBulletCollisions } from './systems/collision-system.js'
import { updateBullets } from './systems/bullet-system.js'
import { updateEnemies } from './systems/enemy-system.js'
import { startFrameLoop } from './systems/frame-loop.js'
import { handleDoorActivation, initializeDoorsFromMap, updateDoors } from './systems/door-system.js'
import { initializeKeycardsFromMap, updateKeycardPickups } from './systems/keycard-system.js'
import { updatePlayer } from './systems/player-system.js'
import { bindControls } from './ui/controls.js'

window.addEventListener('load', init)

function init() {
  const viewCanvas = document.getElementById('view')
  const mapCanvas = document.getElementById('map')
  const ctx = viewCanvas.getContext('2d')
  const mapCtx = mapCanvas.getContext('2d')

  const map = new GameMap(mapMatrix)
  const keyboard = new Keyboard()
  const player = new Player(300, 300)

  const state = createGameState({
    viewCanvas,
    mapCanvas,
    ctx,
    mapCtx,
    map,
    player,
    keyboard,
    walls,
  })

  setupCanvas(state)
  initializeDoorsFromMap(state)
  initializeKeycardsFromMap(state)
  seedEntities(state)
  bindControls(state)

  startFrameLoop(state, frameState => {
    updateFrame(frameState)
    drawFrame(frameState)
  })
}

function setupCanvas(state) {
  state.canvases.map.width = state.map[0].length * GameMap.size
  state.canvases.map.height = state.map.length * GameMap.size
  state.mapCtx.imageSmoothingEnabled = false
  state.ctx.imageSmoothingEnabled = false
}

function seedEntities(state) {
  const { enemies } = state.entityStore

  enemies.push(new Enemy(600, 450, 10, 'https://i.imgur.com/FcIXhVp.png'))
  enemies.push(
    new Enemy(200, 700, 10, [
      'https://i.imgur.com/rAFkpSc.png',
      'https://i.imgur.com/rYCrqax.png',
      'https://i.imgur.com/p5w5cCU.png',
    ])
  )
  enemies.push(new Entity(600, 750, 40, 'https://i.imgur.com/rgwwS0K.png'))
}

function updateFrame(state) {
  updatePlayer(state)
  updateKeycardPickups(state)
  handleDoorActivation(state)
  updateDoors(state)
  updateEnemies(state)
  updateBullets(state)
  resolveBulletCollisions(state)
}

function drawFrame(state) {
  state.map.draw(state.mapCtx, state.canvases.map, {
    drawMap: state.drawMap,
    textures: state.walls,
  })

  drawRaycastScene(state)
  state.player.draw2D(state.mapCtx, state.drawMap)
  drawEntities2D(state)
  drawUI(state)
}
