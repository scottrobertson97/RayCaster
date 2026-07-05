import { Entity } from '../entities/entity.js'
import { Enemy } from '../entities/enemy.js'
import { Pickup } from '../entities/pickup.js'
import { Player } from '../entities/player.js'
import { GameMap } from '../map/game-map.js'

export function createLevelRuntimeData(level) {
  return {
    map: new GameMap(level.map),
    player: createPlayer(level.playerStart),
    entities: createEntities(level.entities),
  }
}

function createPlayer(playerStart = {}) {
  return new Player(playerStart.x ?? 0, playerStart.y ?? 0, playerStart.a ?? 0)
}

function createEntities(entityDefinitions = []) {
  return entityDefinitions.reduce(
    (entities, definition) => {
      const entity = createEntity(definition)
      if (definition.type === 'enemy') {
        entities.enemies.push(entity)
      } else if (definition.type === 'sprite') {
        entities.sprites.push(entity)
      } else if (definition.type === 'pickup') {
        entities.pickups.push(entity)
      }
      return entities
    },
    { enemies: [], bullets: [], pickups: [], sprites: [] }
  )
}

function createEntity({ type, x, y, size, asset, pickupType }) {
  if (type === 'enemy') {
    return new Enemy(x, y, size, asset)
  }

  if (type === 'sprite') {
    return new Entity(x, y, size, asset)
  }

  if (type === 'pickup') {
    return new Pickup(x, y, size, asset, pickupType)
  }

  throw new Error(`Unknown level entity type: ${type}`)
}
