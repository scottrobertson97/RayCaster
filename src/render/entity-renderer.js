import { dist } from '../math/geometry.js'
import { WORLD_HEIGHT_RATIO } from '../config/constants.js'
import { castSceneRays } from '../systems/raycast-system.js'
import { fillSceneBackground } from './background-renderer.js'
import { drawRayWall } from './wall-renderer.js'

function addEntityRays(state, rays, entitiesList) {
  entitiesList.forEach((entity, index) => {
    if (entity.drawn) {
      rays.push({
        disT: dist(entity.x, entity.y, state.player.x, state.player.y),
        isSprite: true,
        index,
      })
    }
  })
}

export function drawEntities2D(state) {
  state.entityStore.getEntities().forEach(entity => entity.draw2D(state.mapCtx, state.drawMap))
}

export function drawRaycastScene(state) {
  fillSceneBackground(state)

  const visibleEntities = state.entityStore.getEntities()
  visibleEntities.forEach(entity => {
    entity.drawn = false
  })

  const rays = castSceneRays(state, visibleEntities)
  addEntityRays(state, rays, visibleEntities)

  rays.sort((a, b) => b.disT - a.disT)
  const worldHeight = state.view.height * WORLD_HEIGHT_RATIO
  const pitchOffset = Math.tan(state.player.pitch) * (worldHeight * 0.5)
  const drawOptions = { fov: state.fov, drawMap: state.drawMap, pitchOffset }

  rays.forEach(rayEntry => {
    if (rayEntry.isSprite) {
      visibleEntities[rayEntry.index].draw(
        state.dt,
        state.player,
        state.ctx,
        state.mapCtx,
        state.view,
        drawOptions
      )
    } else {
      drawRayWall(state, rayEntry)
    }
  })

  state.rays = rays
}
