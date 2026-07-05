import { dist } from '../math/geometry.js'
import { WORLD_HEIGHT_RATIO } from '../config/constants.js'
import { castSceneRays } from '../systems/raycast-system.js'
import { fillSceneBackground } from './background-renderer.js'
import { drawSpriteEntity, drawSpriteEntity2D } from './sprite-renderer.js'
import { isSpriteVisible, resetSpriteVisibility } from './sprite-visibility.js'
import { drawRayWall } from './wall-renderer.js'
import type { Entity } from '../entities/entity.js'
import type { GameState, RenderRayEntry } from '../types.js'

function addEntityRays(state: GameState, rays: RenderRayEntry[], entitiesList: Entity[]) {
  entitiesList.forEach((entity, index) => {
    if (isSpriteVisible(entity)) {
      rays.push({
        disT: dist(entity.x, entity.y, state.world.player.x, state.world.player.y),
        isSprite: true,
        index,
      })
    }
  })
}

export function drawEntities2D(state: GameState) {
  state.entities.getEntities().forEach(entity => drawSpriteEntity2D(entity, state))
}

export function drawRaycastScene(state: GameState) {
  fillSceneBackground(state)

  const visibleEntities = state.entities.getEntities()
  resetSpriteVisibility(visibleEntities)

  const rays: RenderRayEntry[] = castSceneRays(state, visibleEntities)
  addEntityRays(state, rays, visibleEntities)

  rays.sort((a, b) => b.disT - a.disT)
  const worldHeight = state.render.view.height * WORLD_HEIGHT_RATIO
  const pitchOffset = Math.tan(state.world.player.pitch) * (worldHeight * 0.5)
  const drawOptions = { fov: state.render.fov, drawMap: state.render.drawMap, pitchOffset }

  rays.forEach(rayEntry => {
    if (rayEntry.isSprite) {
      drawSpriteEntity(visibleEntities[rayEntry.index], state, drawOptions)
    } else {
      drawRayWall(state, rayEntry)
    }
  })

  state.render.rays = rays
}
