import React from "react"
import Head from 'next/head'
import styles from 'styles/Game.module.css'
import Emulator from '../components/game/Emulator'

export default function Game() {
  return (
    <div className={styles.app}>
      <div className={styles.main}>
        <Emulator paused={false} />
      </div>
    </div>
  )
}
