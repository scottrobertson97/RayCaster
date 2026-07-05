import { Entity } from '../entities/entity.js'
import { Enemy } from '../entities/enemy.js'
import { Pickup } from '../entities/pickup.js'
import { Player } from '../entities/player.js'
import { GameMap } from '../map/game-map.js'
import type { LevelDefinition, LevelEntityDefinition, PlayerStart, RuntimeEntities } from '../types.js'

export function createLevelRuntimeData(level: LevelDefinition) {
  return {
    map: new GameMap(level.map),
    player: createPlayer(level.playerStart),
    entities: createEntities(level.entities),
  }
}

function createPlayer(playerStart: PlayerStart = {}) {
  return new Player(playerStart.x ?? 0, playerStart.y ?? 0, playerStart.a ?? 0)
}

function createEntities(entityDefinitions: LevelEntityDefinition[] = []): RuntimeEntities {
  return entityDefinitions.reduce(
    (entities, definition) => {
      if (definition.type === 'enemy') {
        entities.enemies.push(new Enemy(definition.x, definition.y, definition.size, definition.asset))
      } else if (definition.type === 'sprite') {
        entities.sprites.push(new Entity(definition.x, definition.y, definition.size, definition.asset))
      } else if (definition.type === 'pickup') {
        entities.pickups.push(
          new Pickup(
            definition.x,
            definition.y,
            definition.size,
            definition.asset,
            definition.pickupType,
          ),
        )
      }
      return entities
    },
    { enemies: [], bullets: [], pickups: [], sprites: [] } as RuntimeEntities
  )
}
