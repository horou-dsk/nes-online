import React, {useEffect, useRef, useState} from 'react'
import GLScreen from './GLScreen'
import Speakers from './Speakers'
import { NES } from 'jsnes'
import KeyboardController from './KeyboardController'
import FrameTimer from './FrameTimer'
import styles from './game.module.css'
import CanvasScreen from './CanvasScreen'
import Room from './Room'

const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 240;
const FRAMEBUFFER_SIZE = SCREEN_WIDTH*SCREEN_HEIGHT;

// interface EmulatorProps {
//   paused: boolean
// }

export default function Emulator() {


  const [render, setRender] = useState()

  const glScreen = useRef<{ render: (imageData: ImageData) => void }>()

  const loadRom = () => new Promise(resolve => {
    const req = new XMLHttpRequest();
    const path = '/roms/rx.nes'
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

    const frameTimer = new FrameTimer(
      () => {
        // keyboardController.turbo()
        room.frame()
      },
      () => {
        imageData.data.set(buf8)
        glScreen.current?.render(imageData)
      }
    )
    console.log('ooo======================================================o');
    const onWindowClick = () => {
      speakers.start()
    }
    loadRom()
      .then((rom) => {
        // console.log(rom)
        nes.loadROM(rom)
        frameTimer.start()
        window.addEventListener('click', onWindowClick)
        setInterval(() => {
          console.log(`FPS: ${nes.getFPS()}`)
          // console.log(keyboardController.key_state)
        }, 1000)
      })
    return () => {
      window.removeEventListener('click', onWindowClick)
      // document.removeEventListener('keydown', keyboardController.handleKeyDown)
      // document.removeEventListener('keyup', keyboardController.handleKeyUp)
      room.release()
      frameTimer.stop()
      speakers.stop()
    }
  }, [])

  return (
    <div className={styles.emulator}>
      <GLScreen ref={glScreen} />
    </div>
  )
}
