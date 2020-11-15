import React, {RefObject, TouchEventHandler, useEffect, useRef, useState} from 'react'
import styles from './virtual_key.module.css'

const DISC_LEFT = 30, DISC_TOP = 25, DISC_SIZE = 150

interface VirtualKeyProps {
  onChange: (keys: number[]) => void
}

function VirtualKey(props: VirtualKeyProps) {

  const { onChange } = props

  const joystick = useRef<HTMLDivElement>(null)

  const [{x, y}, setXy] = useState({x: 0, y: 0})

  // A, B, SELECT, START, 上, 下, 左, 右
  const [key_state, setKeyState] = useState(Array.from(new Uint8Array(10)))

  const handleTouchMove: TouchEventHandler = (event) => {
    const touch = event.touches[0]
    const size = DISC_SIZE / 2
    const x = touch.pageY - DISC_TOP - size
    const y = touch.pageX - DISC_LEFT - size
    const angle = Math.atan2(y, x)
    const wz = angle / Math.PI * 180
    const _size = Math.min(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)), size)
    if (_size < size / 2) return setKeyState(key_state.slice(0, 4).concat([0, 0, 0, 0]))
    setXy({x: Math.cos(angle) * _size, y: Math.sin(angle) * _size})
    const keys = [0, 0, 0, 0]
    if (wz < 30 && wz > -30) {
      // 右
      keys[3] = 1
    } else if (wz > 30 && wz < 60) {
      // 右上
      keys[3] = 1
      keys[0] = 1
    } else if (wz > 60 && wz < 120) {
      // 上
      keys[0] = 1
    } else if (wz > 120 && wz < 150) {
      // 左上
      keys[2] = 1
      keys[0] = 1
    } else if (wz > 150 || wz < -150) {
      // 左
      keys[2] = 1
    } else if (wz > -150 && wz < -120) {
      // 左下
      keys[2] = 1
      keys[1] = 1
    } else if (wz > -120 && wz < -60) {
      // 下
      keys[1] = 1
    } else if (wz > -60 && wz < -30) {
      // 右下
      keys[1] = 1
      keys[3] = 1
    }
    setKeyState(key_state.slice(0, 4).concat(keys))
  }

  const handleTouchEnd: TouchEventHandler = (event) => {
    setKeyState(key_state.slice(0, 4).concat([0, 0, 0, 0]))
    setXy({x: 0, y: 0})
  }

  const handleKey = (key: number, v: number) => () => {
    key_state[key] = v
    onChange(key_state)
  }

  useEffect(() => {
    onChange(key_state)
  }, [key_state])

  return (
    <div className={styles.main}>
      <div
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchMove}
        onTouchCancel={handleTouchEnd}
        onTouchEnd={handleTouchEnd}
        className={styles.disc}
      >
        <div style={{transform: `translate(${y}px, ${x}px)`}} className={styles.joystick} ref={joystick} />
      </div>
      <div onTouchStart={() => {
        key_state[3] = 1
        onChange(key_state)
      }} onTouchEnd={() => {
        key_state[3] = 0
        onChange(key_state)
      }} className={styles.start}>开始</div>
      <div
        onTouchStart={() => {
          key_state[2] = 1
          onChange(key_state)
        }}
        onTouchEnd={() => {
          key_state[2] = 0
          onChange(key_state)
        }}
        className={styles.select}
      >选择</div>
      <div
        onTouchStart={handleKey(9, 1)}
        onTouchEnd={handleKey(9, 0)}
        className={styles.turboB}
      >
        B
      </div>
      <div
        onTouchStart={handleKey(8, 1)}
        onTouchEnd={handleKey(8, 0)}
        className={styles.turboA}
      >
        A
      </div>
      <div
        onTouchStart={handleKey(1, 1)}
        onTouchEnd={handleKey(1, 0)}
        className={styles.B}
      >
        B
      </div>
      <div
        onTouchStart={handleKey(0, 1)}
        onTouchEnd={handleKey(0, 0)}
        className={styles.A}
      >
        A
      </div>
    </div>
  )
}

export default VirtualKey
