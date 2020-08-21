type OnButton = (player: number, keyCode: number) => void

function Message(data: {[key: string]: any}) {
  return JSON.stringify(data)
}

export default class Room {

  socket = new WebSocket('ws://127.0.0.1:9766/')

  constructor(private onButtonDown: OnButton, private onButtonUp: OnButton) {
    this.socket.addEventListener('open', this.on_open)
    this.socket.addEventListener('close', this.on_close)
    this.socket.addEventListener('message', this.on_message)
  }

  on_open = () => {
    this.socket.send(Message({ mid: 1, name: '玩家' }))
  }

  on_close = () => {

  }

  on_message = (event: MessageEvent) => {
    const data = JSON.parse(event.data)
    const [type, value] = Object.entries(data)[0]
    switch (type) {
      case 'SendKeyboard':

        break
    }
  }
}
