import React from 'react'
import styles from './controls.module.css'
import events from '../../lib/events'

function Controls() {
  return (
    <div className={styles.main}>
      <button onClick={() => {
        events.emit('nes-save')
      }} className="nes-btn">
        Save
      </button>
      <button onClick={() => {
        events.emit('nes-load')
      }} className="nes-btn">
        Load
      </button>
    </div>
  )
}

export default Controls
