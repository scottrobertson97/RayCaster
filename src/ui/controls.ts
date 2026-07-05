import { DEFAULT_HOR_RES } from '../config/constants.js'
import type { GameState } from '../types.js'

export function setHorizontalResolution(state: GameState, value: string | number) {
  state.render.horRes = Number(value)
  state.render.halfHorRes = state.render.horRes / 2
}

export function toggleMap(state: GameState) {
  state.render.drawMap = !state.render.drawMap
  state.render.canvases.map.style.display = state.render.drawMap ? 'block' : 'none'
}

export function toggleFog(state: GameState) {
  state.render.fogEnabled = !state.render.fogEnabled
}

export function bindControls(state: GameState, root: Document = document) {
  root.querySelectorAll('input[type="radio"][name="quality"]').forEach(radio => {
    radio.addEventListener('change', e => {
      if (e.target instanceof HTMLInputElement) {
        setHorizontalResolution(state, e.target.value)
      }
    })
  })

  const mapButton = root.getElementById('toggle-map')
  if (mapButton) {
    mapButton.addEventListener('click', () => toggleMap(state))
  }

  const fogButton = root.getElementById('toggle-fog')
  if (fogButton) {
    fogButton.addEventListener('click', () => toggleFog(state))
  }

  setHorizontalResolution(state, DEFAULT_HOR_RES)
}
