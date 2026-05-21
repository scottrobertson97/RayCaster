import { Entity } from '../entities/entity.js'
import { Enemy } from '../entities/enemy.js'
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
      } else {
        entities.enemies.push(entity)
      }
      return entities
    },
    { enemies: [], bullets: [], pickups: [] }
  )
}

function createEntity({ type, x, y, size, asset }) {
  if (type === 'enemy') {
    return new Enemy(x, y, size, asset)
  }

  return new Entity(x, y, size, asset)
}
