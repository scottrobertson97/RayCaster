import type { Bullet } from './entities/bullet.js'
import type { Enemy } from './entities/enemy.js'
import type { Entity } from './entities/entity.js'
import type { Pickup } from './entities/pickup.js'
import type { Player } from './entities/player.js'
import type { Keyboard } from './input/keyboard-state.js'
import type { GameMap } from './map/game-map.js'

export type Point = {
  x: number
  y: number
}

export type LineSegment = {
  x1: number
  y1: number
  x2: number
  y2: number
}

export type AssetRef = string
export type KeyType = 'red' | 'green'
export type GamePhase = 'playing' | 'gameOver'
export type WallTextureArray = Array<HTMLImageElement | undefined>

export type SpriteMinimapOptions = {
  fillStyle?: string
  strokeStyle?: string
}

export type SpriteOptions = {
  height?: number
  minimap?: SpriteMinimapOptions
}

export type SpriteDescriptor = {
  assetRefs: AssetRef[]
  frameIndex: number
  frameRate: number
  frameTick: number
  height: number
  visible: boolean
  minimap: SpriteMinimapOptions
}

export type DoorPhase = 'closed' | 'opening' | 'open' | 'closing'

export type DoorState = {
  tileX: number
  tileY: number
  locked: boolean
  requiredKey: KeyType | null
  closedTileId: number
  phase: DoorPhase
  openAmount: number
  holdTimer: number
}

export type TileDefinition = {
  id: number
  type: 'empty' | 'wall' | 'door' | 'unknownSolid'
  solid: boolean
  texture?: AssetRef
  locked?: boolean
  requiredKey?: KeyType
  closedTileId?: number
  unlockedTileId?: number
}

export type EntityStore = {
  bullets: Bullet[]
  enemies: Enemy[]
  pickups: Pickup[]
  sprites: Entity[]
  getEntities(): Entity[]
}

export type RuntimeEntities = Omit<EntityStore, 'getEntities'>

export type LevelRuntimeData = {
  map: GameMap
  player: Player
  entities: RuntimeEntities
}

export type GameState = {
  world: {
    map: GameMap
    player: Player
    doors: Record<string, DoorState>
    inventory: {
      hasRedKeycard: boolean
      hasGreenKeycard: boolean
    }
  }
  entities: EntityStore
  input: {
    keyboard: Keyboard
  }
  ui: {
    notice: {
      text: string
      timer: number
    }
    damageFlashTimer: number
    hitMarkerTimer: number
    fpsCounterBuffer: number
    fpsLast: number
  }
  assets: {
    walls: WallTextureArray
  }
  render: {
    canvases: {
      view: HTMLCanvasElement
      map: HTMLCanvasElement
    }
    ctx: CanvasRenderingContext2D
    mapCtx: CanvasRenderingContext2D
    drawMap: boolean
    fogEnabled: boolean
    drawRays: boolean
    fov: number
    horRes: number
    halfHorRes: number
    rays: RenderRayEntry[]
    fog: {
      START: number
      END: number
    }
    view: {
      readonly width: number
      readonly height: number
      readonly halfHeight: number
    }
  }
  runtime: {
    lastTime: number
    dt: number
    phase: GamePhase
    restartRequested: boolean
  }
}

export type System = {
  name: string
  run(state: GameState): void
}

export type RayHit = {
  hit: boolean
  distance: number
  point: Point
  map: Point | null
  isUp?: boolean
  isLeft?: boolean
}

export type WallRayEntry = {
  ray: Point & { a: number }
  mp: Point | null
  disT: number
  isVertical: boolean
  isUp: boolean
  isLeft: boolean
  r: number
  colorMod: number
  hit: boolean
  isSprite?: false
}

export type SpriteRayEntry = {
  disT: number
  isSprite: true
  index: number
}

export type RenderRayEntry = WallRayEntry | SpriteRayEntry

export type PlayerStart = {
  x?: number
  y?: number
  a?: number
}

export type EnemyLevelEntityDefinition = {
  type: 'enemy'
  x: number
  y: number
  size: number
  asset: AssetRef | AssetRef[]
}

export type SpriteLevelEntityDefinition = {
  type: 'sprite'
  x: number
  y: number
  size: number
  asset: AssetRef | AssetRef[]
}

export type PickupLevelEntityDefinition = {
  type: 'pickup'
  x: number
  y: number
  size: number
  asset: AssetRef
  pickupType: KeyType
}

export type LevelEntityDefinition =
  | EnemyLevelEntityDefinition
  | SpriteLevelEntityDefinition
  | PickupLevelEntityDefinition

export type LooseLevelEntityDefinition = {
  type: 'enemy' | 'sprite' | 'pickup'
  x: number
  y: number
  size: number
  asset: AssetRef | AssetRef[]
  pickupType?: KeyType
}

export type LevelDefinition = {
  map: number[][]
  playerStart?: PlayerStart
  entities?: LevelEntityDefinition[]
}

export type RaycasterGameOptions = {
  viewCanvas: HTMLCanvasElement
  mapCanvas: HTMLCanvasElement
  map: GameMap
  player: Player
  keyboard: Keyboard
  walls: WallTextureArray
  entities?: Partial<RuntimeEntities>
  resetLevel?: () => LevelRuntimeData
  controlsRoot?: Document
}

export type CreateGameStateOptions = {
  viewCanvas: HTMLCanvasElement
  mapCanvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  mapCtx: CanvasRenderingContext2D
  map: GameMap
  player: Player
  keyboard: Keyboard
  walls: WallTextureArray
}
