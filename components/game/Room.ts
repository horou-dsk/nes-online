import KeyboardController from './KeyboardController'
import events from '../../lib/events'

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

  private isBuffering = false
  // socket = new WebSocket('ws://149.129.78.64:8778/ws')

  socket = new WebSocket('ws://192.168.5.198:8778/ws')

  // socket = new WebSocket('ws://47.108.64.61:9699/ws')

  keyboardController = new KeyboardController(1, this.nes.buttonDown, this.nes.buttonUp)

  key_buffer: number[][][] = []

  key_record: number[][] = [[], Array.from(new Uint8Array(10)), Array.from(new Uint8Array(10))]

  frame_sum = 0

  constructor(private nes: any, private onPaused: (paused: boolean) => void) {
    this.socket.addEventListener('open', this.on_open)
    this.socket.addEventListener('close', this.on_close)
    this.socket.addEventListener('message', this.on_message)
    document.addEventListener("keydown", event => this.keyboardController.handleKeyDown(event))
    document.addEventListener("keyup", event => this.keyboardController.handleKeyUp(event))
    // document.addEventListener('keypress', event => {
    //   // this.paused = !this.paused
    //   if (event.code === 'Space') {
    //     this.socket.send(Message({ mid: 7 }))
    //   }
    // })
    events.on('nes-load', () => {
      this.nes.fromJSON(JSON.parse(localStorage.getItem('nes-json') ?? ''))
    })
    events.on('nes-save', () => {
      localStorage.setItem('nes-json', JSON.stringify(this.nes.toJSON()))
      console.log('存档成功')
    })
  }

  runFrame() {
    const key_state = this.key_buffer.shift()
    this.frame_sum ++
    if(key_state) {
      key_state.forEach(state => {
        this.key_record[state[10]] = this.key_record[state[10]]?.map((v, i) => v + state[i]).slice(0, 8).concat([this.frame_sum])
        this.keyboardController.from_key_state(state)
      })
    }
    this.nes.frame()
  }

  localFrame() {
    this.keyboardController.turbo()
    this.keyboardController.frame()
    this.nes.frame()
  }

  frame() {
    if (this.paused || this.game_state === GAME_STATE.WAIT) return
    this.keyboardController.turbo()
    this.socket.send(Message({mid: 10, keys: this.keyboardController.key_state}))

    if (this.key_buffer.length < MIN_BUFFER_SIZE) {
      this.isBuffering = true
      return
    }

    if (this.key_buffer.length > MAX_BUFFER_SIZE) {
      const len = this.key_buffer.length - MAX_BUFFER_SIZE
      for (let i = 0; i < len; i++) {
        this.runFrame()
      }
    }

    if (this.isBuffering && this.key_buffer.length < MAX_BUFFER_SIZE) return
    else this.runFrame()

  }

  // serverFrame(buffer: number[][]) {
  //   this.keyboardController.turbo()
  //   this.socket.send(Message({mid: 10, keys: this.keyboardController.key_state}))
  //   buffer.forEach(value => {
  //     this.keyboardController.from_key_state(value);
  //   })
  //   this.nes.frame();
  // }

  release() {
    document.removeEventListener('keydown', this.keyboardController.handleKeyDown)
    document.removeEventListener('keyup', this.keyboardController.handleKeyUp)
    events.removeAllListeners('nes-load')
    events.removeAllListeners('nes-save')
  }

  on_open = () => {
    this.socket.send(Message({ mid: 1, name: '玩家' }))
  }

  on_close = () => {
    console.log('与服务器连接断开了')
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
        if (value === 1) {
          // this.socket.send(Message({ mid: 4 }))
          // this.game_state = GAME_STATE.PLAYING
        } else {
          this.socket.send(Message({ mid: 4 }))
        }
        break
      case 'SendKeyboard':
        // this.serverFrame(value)
        if (value.length)
          this.key_buffer.push(value)
        // this.keyboardController.from_key_state(1, value)
        break
      case 'GetGameStatus':
        if (this.currentPlayer === 1) {
          this.paused = true
          const message = Message({mid: 5, json_data: JSON.stringify(this.nes.toJSON()), id: value})
          this.socket.send(message)
        }
        break
      case 'SendGameStatus':
        if (this.game_state === GAME_STATE.WAIT) {
          this.nes.fromJSON(JSON.parse(value))
          this.game_state = GAME_STATE.PLAYING
          this.key_buffer = []
          this.socket.send(Message({ mid: 6 }))
        }
        break
      case 'GameStart':
        this.paused = false
        this.game_state = GAME_STATE.PLAYING
        break
    }
  }
}
