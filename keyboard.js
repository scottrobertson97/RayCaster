class Keyboard {
  constructor(logKeystrokes = false) {
    this.logKeystrokes = logKeystrokes;
    this.keydown = [];
    this.previousKeydown = [];
    window.addEventListener(
      "keydown",
      function (e) {
        if (logKeystrokes) console.log("keydown=" + e.keyCode);
        this.keydown[e.keyCode] = true;
      }.bind(this)
    );

    window.addEventListener(
      "keyup",
      function (e) {
        if (logKeystrokes) console.log("keyup=" + e.keyCode);
        this.keydown[e.keyCode] = false;
      }.bind(this)
    );
  }

  move() {
    let d = 0;
    if (
      this.keydown[Keyboard.KEYBOARD.KEY_UP] ||
      this.keydown[Keyboard.KEYBOARD.KEY_W]
    ) {
      d += 1;
    }
    if (
      this.keydown[Keyboard.KEYBOARD.KEY_DOWN] ||
      this.keydown[Keyboard.KEYBOARD.KEY_S]
    ) {
      d -= 1;
    }
    return d;
  }

  turn() {
    let d = 0;
    if (
      this.keydown[Keyboard.KEYBOARD.KEY_RIGHT] ||
      this.keydown[Keyboard.KEYBOARD.KEY_D]
    ) {
      d += 1;
    }
    if (
      this.keydown[Keyboard.KEYBOARD.KEY_LEFT] ||
      this.keydown[Keyboard.KEYBOARD.KEY_A]
    ) {
      d -= 1;
    }
    return d;
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
  };
}
