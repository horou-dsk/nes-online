import React, {useEffect, useRef, useState} from 'react'
import GLScreen from './GLScreen'
import Speakers from './Speakers'
import { NES } from 'jsnes'
import KeyboardController from './KeyboardController'
import FrameTimer from './FrameTimer'
import styles from './game.module.css'
import CanvasScreen from './CanvasScreen'
import Room from './Room'
import VirtualKey from './VirtualKey'
import events from '../../lib/events'
import Controls from './Controls'
import ThreeScreen from './ThreeScreen'

const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 240;
const FRAMEBUFFER_SIZE = SCREEN_WIDTH*SCREEN_HEIGHT;

export default function Emulator() {

  const [render, setRender] = useState()

  const [isPhone, setIsPhone] = useState(false)

  const [fps, setFps] = useState(0)

  const [key_record, setKeyRecord] = useState<number[][]>([])

  const glScreen = useRef<{ render: (imageData: ImageData) => void }>()

  const loadRom = () => new Promise(resolve => {
    const req = new XMLHttpRequest();
    // const path = '/roms/Nekketsu Monogatari (J).nes'
    // const path = '/roms/rx.nes'
    const path = '/roms/Contra (U).nes'
    req.open("GET", path);
    req.overrideMimeType("text/plain; charset=x-user-defined");
    req.onerror = () => console.log(`Error loading ${path}: ${req.statusText}`);

    req.onload = function() {
      if (this.status === 200) {
        resolve(this.responseText)
      } else if (this.status === 0) {
        // Aborted, so ignore error
      } else {
        // @ts-ignore
        req.onerror();
      }
    }

    req.send();
  })

  useEffect(() => {
    const sUserAgent = navigator.userAgent

    setIsPhone(sUserAgent.indexOf('Android') > -1 || sUserAgent.indexOf('iPhone') > -1 || sUserAgent.indexOf('iPad') > -1 || sUserAgent.indexOf('iPod') > -1 || sUserAgent.indexOf('Symbian') > -1)

    let paused = false

    let imageData = new ImageData(SCREEN_WIDTH, SCREEN_HEIGHT)

    const buf = new ArrayBuffer(imageData.data.length)

    const buf8 = new Uint8ClampedArray(buf)

    let framebuffer_u32 = new Uint32Array(buf)

    const speakers = new Speakers({
      onBufferUnderrun: (actualSize, desiredSize) => {
        if (paused) {
          return;
        }
        // Skip a video frame so audio remains consistent. This happens for
        // a variety of reasons:
        // - Frame rate is not quite 60fps, so sometimes buffer empties
        // - Page is not visible, so requestAnimationFrame doesn't get fired.
        //   In this case emulator still runs at full speed, but timing is
        //   done by audio instead of requestAnimationFrame.
        // - System can't run emulator at full speed. In this case it'll stop
        //    firing requestAnimationFrame.
        console.log(
          "Buffer underrun, running another frame to try and catch up"
        );

        frameTimer.generateFrame();
        // desiredSize will be 2048, and the NES produces 1468 samples on each
        // frame so we might need a second frame to be run. Give up after that
        // though -- the system is not catching up
        if (speakers.buffer.size() < desiredSize) {
          console.log("Still buffer underrun, running a second frame");
          frameTimer.generateFrame();
        }
      }
    })

    const nes = new NES({
      onFrame: (framebuffer_24: number[]) => {
        for(let i = 0; i < FRAMEBUFFER_SIZE; i++) framebuffer_u32[i] = 0xFF000000 | framebuffer_24[i];
      },
      onStatusUpdate: console.log,
      onAudioSample: speakers.writeSample,
      sampleRate: speakers.getSampleRate()
    })

    // const keyboardController = new KeyboardController(1, nes.buttonDown, nes.buttonUp)
    // document.addEventListener("keydown", keyboardController.handleKeyDown)
    // document.addEventListener("keyup", keyboardController.handleKeyUp)

    // const socket = new WebSocket('ws://127.0.0.1:9766/')
    const room = new Room(nes, _paused => paused = _paused)
    events.on('onKeys', (keys: number[]) => {
      const key_state = room.keyboardController?.key_state
      keys.forEach((v, i) => {key_state[i] = v})
    })
    const local = !location.search
    const frameTimer = new FrameTimer(
      () => {
        if (local) room.localFrame()
        else room.frame()
      },
      () => {
        imageData.data.set(buf8)
        glScreen.current?.render(imageData)
      }
    )
    const onWindowClick = () => {
      speakers.start()
    }
    loadRom()
      .then((rom) => {
        nes.loadROM(rom)
        frameTimer.start()
        window.addEventListener('click', onWindowClick)
        setInterval(() => {
          setKeyRecord(room.key_record)
          setFps(Math.floor(nes.getFPS()))
          // console.log(`FPS: ${nes.getFPS()}`)
        }, 1000)
      })
    return () => {
      window.removeEventListener('click', onWindowClick)
      room.release()
      frameTimer.stop()
      speakers.stop()
    }
  }, [])

  return (
    <div className={styles.emulatorMain}>
      {/*<div className={styles.keyRecord}>
        {key_record.map(v => v.toString() + '  ')}
      </div>*/}
      <div className={isPhone ? styles.phoneEmulator : styles.emulator}>
        <ThreeScreen ref={glScreen} />
        {/*<GLScreen ref={glScreen} />*/}
        {/*<CanvasScreen ref={glScreen} />*/}
        <div className={styles.fps}>FPS:{fps}</div>
      </div>
      {isPhone && <VirtualKey onChange={keys => {
        events.emit('onKeys', keys)
      }} />}
      <Controls />
    </div>
  )
}
