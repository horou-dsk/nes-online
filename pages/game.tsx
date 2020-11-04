import React, {useEffect, useState} from 'react'
import styles from 'styles/Game.module.css'
import Emulator from '../components/game/Emulator'

export default function Game() {
  return (
    <div className={styles.app}>
      <div className={styles.main}>
        <Emulator />
      </div>
    </div>
  )
}
