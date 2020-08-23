import KeyboardController from './KeyboardController'

type OnButton = (player: number, keyCode: number) => void

function Message(data: {[key: string]: any}) {
  return JSON.stringify(data)
}

export default class Room {

  socket = new WebSocket('ws://127.0.0.1:9766/')

  keyboardController = new KeyboardController(1, this.nes.buttonDown, this.nes.buttonUp)

  constructor(private nes: any) {
    this.socket.addEventListener('open', this.on_open)
    this.socket.addEventListener('close', this.on_close)
    this.socket.addEventListener('message', this.on_message)
    document.addEventListener("keydown", this.keyboardController.handleKeyDown)
    document.addEventListener("keyup", this.keyboardController.handleKeyUp)
  }

  frame() {
    if (!window.location.search) {
      this.socket.send(this.keyboardController.key_state.buffer)
    }
    this.keyboardController.turbo()
  }

  release() {
    document.removeEventListener('keydown', this.keyboardController.handleKeyDown)
    document.removeEventListener('keyup', this.keyboardController.handleKeyUp)
  }

  on_open = () => {
    this.socket.send(Message({ mid: 2, name: '玩家' }))
  }

  on_close = () => {

  }

  on_message = (event: MessageEvent) => {
    const data = JSON.parse(event.data)
    const [type, value] = Object.entries(data)[0] as [string, any]
    switch (type) {
      case 'SendKeyboard':
        console.log(value)
        this.keyboardController.from_key_state(1, value)
        break
      case 'GetGameStatus':
        this.socket.send(JSON.stringify({mid: 5, json_data: JSON.stringify(this.nes.toJSON())}))
        break
      case 'SendGameStatus':
        this.nes.fromJSON(JSON.parse(value.data))
        break
    }
  }
}
