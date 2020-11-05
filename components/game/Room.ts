import KeyboardController from './KeyboardController'

// type OnButton = (player: number, keyCode: number) => void

function Message(data: {[key: string]: any}) {
  return JSON.stringify(data)
}

const MIN_BUFFER_SIZE = 1
const MAX_BUFFER_SIZE = 1

enum GAME_STATE {
  WAIT,
  PLAYING
}

export default class Room {

  private _paused = false

  set paused(b: boolean) {
    this._paused = b
    this.onPaused(b)
  }

  get paused() {
    return this._paused
  }

  private game_state = GAME_STATE.WAIT

  private currentPlayer = 0

  socket = new WebSocket('ws://127.0.0.1:8778/ws')

  keyboardController = new KeyboardController(1, this.nes.buttonDown, this.nes.buttonUp)

  key_buffer: number[][] = []

  constructor(private nes: any, private onPaused: (paused: boolean) => void) {
    this.socket.addEventListener('open', this.on_open)
    this.socket.addEventListener('close', this.on_close)
    this.socket.addEventListener('message', this.on_message)
    document.addEventListener('click', () => {
      this.paused = !this.paused
    })
  }

  frame() {
    // if (!window.location.search) {
    //   this.socket.send(this.keyboardController.key_state.buffer)
    // }
    if (this.paused || this.game_state === GAME_STATE.WAIT) return
    this.socket.send(this.keyboardController.key_state.buffer)
    this.keyboardController.turbo()
    if (this.currentPlayer > 1) {
      if (this.key_buffer.length < MIN_BUFFER_SIZE) {
      }
      if (this.key_buffer.length > MAX_BUFFER_SIZE) {
        for (let i = 0; i < this.key_buffer.length - MAX_BUFFER_SIZE; i++) {
          const key_state = this.key_buffer.shift()
          if(key_state) this.keyboardController.from_key_state(key_state)
          this.nes.frame()
        }
      }
    } else {
      const key_state = this.key_buffer.shift()
      if (key_state)
        this.keyboardController.from_key_state(key_state)
      this.nes.frame()
    }
  }

  release() {
    document.removeEventListener('keydown', this.keyboardController.handleKeyDown)
    document.removeEventListener('keyup', this.keyboardController.handleKeyUp)
  }

  on_open = () => {
    this.socket.send(Message({ mid: 1, name: '玩家' }))
  }

  on_close = () => {

  }

  on_message = (event: MessageEvent) => {
    let data
    try {
      data = JSON.parse(event.data)
    } catch (err) {
      console.log('Json解析失败', event.data)
      return
    }
    const [type, value] = Object.entries(data)[0] as [string, any]
    switch (type) {
      case 'GameReady':
        this.currentPlayer = value
        this.keyboardController = new KeyboardController(value, this.nes.buttonDown, this.nes.buttonUp)
        document.addEventListener("keydown", this.keyboardController.handleKeyDown)
        document.addEventListener("keyup", this.keyboardController.handleKeyUp)
        if (value === 1) {
          this.game_state = GAME_STATE.PLAYING
        } else {
          this.socket.send(Message({ mid: 4 }))
        }
        break
      case 'SendKeyboard':
        this.key_buffer.push(value)
        // this.keyboardController.from_key_state(1, value)
        break
      case 'GetGameStatus':
        if (this.currentPlayer === 1) {
          this.paused = true
          this.socket.send(JSON.stringify({mid: 5, json_data: JSON.stringify(this.nes.toJSON())}))
        }
        break
      case 'SendGameStatus':
        if (this.game_state === GAME_STATE.WAIT) {
          this.nes.fromJSON(JSON.parse(value.data))
          this.game_state = GAME_STATE.PLAYING
          this.socket.send(Message({ mid: 6 }))
        }
        break
    }
  }
}
