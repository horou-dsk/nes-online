import { Controller } from "jsnes"

type OnButton = (player: number, keyCode: number) => void

// Mapping keyboard code to [controller, button]
const KEYS = {
  // p1
  75: [1, Controller.BUTTON_A, "K"], // X
  74: [1, Controller.BUTTON_B, "J"], // Y (Central European keyboard)
  90: [1, Controller.BUTTON_B, "Z"], // Z
  70: [1, Controller.BUTTON_SELECT, "F"], // Right Ctrl
  72: [1, Controller.BUTTON_START, "H"], // Enter
  87: [1, Controller.BUTTON_UP, "W"], // Up
  83: [1, Controller.BUTTON_DOWN, "S"], // Down
  65: [1, Controller.BUTTON_LEFT, "A"], // Left
  68: [1, Controller.BUTTON_RIGHT, "D"], // Right
  73: [1, Controller.BUTTON_A, "I", true], // TurboA
  85: [1, Controller.BUTTON_B, "U", true], // TurboB
  // p2
  103: [2, Controller.BUTTON_A, "Num-7"], // Num-7
  105: [2, Controller.BUTTON_B, "Num-9"], // Num-9
  99: [2, Controller.BUTTON_SELECT, "Num-3"], // Num-3
  97: [2, Controller.BUTTON_START, "Num-1"], // Num-1
  104: [2, Controller.BUTTON_UP, "Num-8"], // Num-8
  98: [2, Controller.BUTTON_DOWN, "Num-2"], // Num-2
  100: [2, Controller.BUTTON_LEFT, "Num-4"], // Num-4
  102: [2, Controller.BUTTON_RIGHT, "Num-6"] // Num-6
};

type KeysK = keyof typeof KEYS

export default class KeyboardController {

  private turboSpeed = 1e3 / 30

  private turboKeys = new Set<KeysK>()

  private lastUpdateTime = Date.now()

  private keys = KEYS

  // A, B, SELECT, START, 上, 下, 左, 右
  // public key_state = [0, 0, 0, 0, 0, 0, 0, 0]
  public key_state = Array.from(new Uint8Array(11))

  constructor(private player: number, private onButtonDown: OnButton, private onButtonUp: OnButton) {
    this.key_state[10] = player
  }

  public from_key_state(key_state: number[]) {
    const player = key_state[10]
    for (let k in key_state) {
      if (key_state[k]) {
        this.onButtonDown(player, Number(k))
      } else {
        this.onButtonUp(player, Number(k))
      }
    }
  }

  public frame() {
    // this.turbo()
    this.from_key_state(Array.from(this.key_state))
  }

  private onKeyDown(key: number) {
    this.key_state[key] = 1
    // this.onButtonDown(this.player, key)
  }

  private onKeyUp(key: number) {
    this.key_state[key] = 0
    // this.onButtonUp(this.player, key)
  }

  turbo() {
    const currentTime = Date.now();
    const deltaTime = currentTime - this.lastUpdateTime;
    for(let code of this.turboKeys) {
      const key = this.keys[code];
      if (deltaTime >= this.turboSpeed) {
        this.onKeyDown(key[1]);
        this.lastUpdateTime = currentTime;
      } else {
        this.onKeyUp(key[1]);
      }
    }
  }

  public handleKeyDown = (e: KeyboardEvent) => {
    const code = e.keyCode as KeysK
    const key = this.keys[code];
    if (key) {
      if (key[3]) {
        if (!this.turboKeys.has(code)) {
          this.onKeyDown(key[1]);
          this.turboKeys.add(code);
        }
      } else {
        this.onKeyDown(key[1]);
      }
      e.preventDefault();
    }
  }

  public handleKeyUp = (e: KeyboardEvent) => {
    const code = e.keyCode as KeysK
    const key = this.keys[code];
    if (key) {
      this.onKeyUp(key[1]);
      if (key[3] && this.turboKeys.has(code)) {
        this.turboKeys.delete(code)
      }
      e.preventDefault();
    }
  }

}
