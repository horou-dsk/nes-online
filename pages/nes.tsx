import React, {useEffect, useState} from 'react'
import Head from 'next/head'
import styles from 'styles/Game.module.css'
import Emulator from '../components/game/Emulator'

export default function Nes() {
  useEffect(() => {
    // 禁止ios10双指缩放
    document.addEventListener('gesturestart', function(event) {
      event.preventDefault()
    });
  }, [])
  return (
    <div className={styles.app}>
      <Head>
        <meta name="viewport"
              content="width=device-width,initial-scale = 1.0, minimum-scale=1.0, maximum-scale = 1.0, user-scalable = 0" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* webApp全屏显示，IOS设备 */}
        <meta name='apple-mobile-web-app-capable' content='yes' />
        {/*通用的浏览器*/}
        <meta name='full-screen' content='true' />
        {/*QQ浏览器（X5内核）独有的META*/}
        <meta name='x5-fullscreen' content='true' />
        {/* 360浏览器独有的 */}
        <meta name='360-fullscreen' content='true' />

        <title>NES</title>
      </Head>
      <div className={styles.main}>
        <Emulator />
      </div>
    </div>
  )
}
