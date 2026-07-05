export type KeyboardAction = typeof Keyboard.ACTIONS[keyof typeof Keyboard.ACTIONS]
export type ActionMap = Record<KeyboardAction, number[]>

export class Keyboard {
  keydown: boolean[]
  previousKeydown: boolean[]
  logKeystrokes: boolean
  actionMap: ActionMap

  constructor(logKeystrokes = false, actionMap: ActionMap = DEFAULT_ACTION_MAP) {
    this.keydown = []
    this.previousKeydown = []
    this.logKeystrokes = logKeystrokes
    this.actionMap = actionMap

    window.addEventListener('keydown', e => {
      if (logKeystrokes) console.log('keydown=' + e.keyCode)
      this.keydown[e.keyCode] = true
    })

    window.addEventListener('keyup', e => {
      if (logKeystrokes) console.log('keyup=' + e.keyCode)
      this.keydown[e.keyCode] = false
    })
  }

  actionHeld(action: KeyboardAction) {
    return this.getActionKeys(action).some(keyCode => this.keydown[keyCode])
  }

  actionPressed(action: KeyboardAction) {
    return this.getActionKeys(action).some(
      keyCode => this.keydown[keyCode] && !this.previousKeydown[keyCode]
    )
  }

  actionReleased(action: KeyboardAction) {
    return this.getActionKeys(action).some(
      keyCode => !this.keydown[keyCode] && this.previousKeydown[keyCode]
    )
  }

  getActionKeys(action: KeyboardAction) {
    return this.actionMap[action] ?? []
  }

  move() {
    let d = 0
    if (this.actionHeld(Keyboard.ACTIONS.MOVE_FORWARD)) {
      d += 1
    }
    if (this.actionHeld(Keyboard.ACTIONS.MOVE_BACKWARD)) {
      d -= 1
    }
    return d
  }

  turn() {
    let d = 0
    if (this.actionHeld(Keyboard.ACTIONS.TURN_RIGHT)) {
      d += 1
    }
    if (this.actionHeld(Keyboard.ACTIONS.TURN_LEFT)) {
      d -= 1
    }
    return d
  }

  lookPitch() {
    let d = 0
    if (this.actionHeld(Keyboard.ACTIONS.LOOK_UP)) {
      d += 1
    }
    if (this.actionHeld(Keyboard.ACTIONS.LOOK_DOWN)) {
      d -= 1
    }
    return d
  }

  snapshot() {
    this.previousKeydown = this.keydown.slice()
  }

  static KEYBOARD = {
    KEY_LEFT: 37,
    KEY_UP: 38,
    KEY_RIGHT: 39,
    KEY_DOWN: 40,
    KEY_SPACE: 32,
    KEY_SHIFT: 16,
    KEY_W: 87,
    KEY_S: 83,
    KEY_A: 65,
    KEY_D: 68,
    KEY_E: 69,
    KEY_R: 82,
    KEY_F: 70,
  }

  static ACTIONS = {
    MOVE_FORWARD: 'moveForward',
    MOVE_BACKWARD: 'moveBackward',
    TURN_LEFT: 'turnLeft',
    TURN_RIGHT: 'turnRight',
    LOOK_UP: 'lookUp',
    LOOK_DOWN: 'lookDown',
    FIRE: 'fire',
    INTERACT: 'interact',
  }
}

export const DEFAULT_ACTION_MAP = {
  [Keyboard.ACTIONS.MOVE_FORWARD]: [Keyboard.KEYBOARD.KEY_UP, Keyboard.KEYBOARD.KEY_W],
  [Keyboard.ACTIONS.MOVE_BACKWARD]: [Keyboard.KEYBOARD.KEY_DOWN, Keyboard.KEYBOARD.KEY_S],
  [Keyboard.ACTIONS.TURN_LEFT]: [Keyboard.KEYBOARD.KEY_LEFT, Keyboard.KEYBOARD.KEY_A],
  [Keyboard.ACTIONS.TURN_RIGHT]: [Keyboard.KEYBOARD.KEY_RIGHT, Keyboard.KEYBOARD.KEY_D],
  [Keyboard.ACTIONS.LOOK_UP]: [Keyboard.KEYBOARD.KEY_R],
  [Keyboard.ACTIONS.LOOK_DOWN]: [Keyboard.KEYBOARD.KEY_F],
  [Keyboard.ACTIONS.FIRE]: [Keyboard.KEYBOARD.KEY_SPACE],
  [Keyboard.ACTIONS.INTERACT]: [Keyboard.KEYBOARD.KEY_E],
}
