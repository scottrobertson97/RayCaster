import { dist } from '../math/geometry.js'
import { WORLD_HEIGHT_RATIO } from '../config/constants.js'
import { castSceneRays } from '../systems/raycast-system.js'
import { fillSceneBackground } from './background-renderer.js'
import { drawSpriteEntity, drawSpriteEntity2D } from './sprite-renderer.js'
import { drawRayWall } from './wall-renderer.js'

function addEntityRays(state, rays, entitiesList) {
  entitiesList.forEach((entity, index) => {
    if (entity.sprite?.visible) {
      rays.push({
        disT: dist(entity.x, entity.y, state.world.player.x, state.world.player.y),
        isSprite: true,
        index,
      })
    }
  })
}

export function drawEntities2D(state) {
  state.entities.getEntities().forEach(entity => drawSpriteEntity2D(entity, state))
}

export function drawRaycastScene(state) {
  fillSceneBackground(state)

  const visibleEntities = state.entities.getEntities()
  visibleEntities.forEach(entity => {
    if (entity.sprite) {
      entity.sprite.visible = false
    }
  })

  const rays = castSceneRays(state, visibleEntities)
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
