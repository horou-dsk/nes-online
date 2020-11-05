type OnButton = (player: number, keyCode: number) => void

export default class Controller {
  // 上， 右， 下， 左， select， start， B, A, 玩家
  public key_state = new Uint8Array(11)

  constructor(private onButtonDown: OnButton, private onButtonUp: OnButton) {
  }
}
