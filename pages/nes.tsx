import React, {useEffect, useRef, useState} from 'react'
import Head from 'next/head'
import styles from 'styles/Game.module.css'
import Emulator from '../components/game/Emulator'
import nes from '../components/game/nes.json'

export default function Nes() {

  const [game_path, set_game_path] = useState<string | null>(null);

  const [gameName, setGameName] = useState('');

  const [scrollBtn, setScrollBtn] = useState(false);

  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // 禁止ios10双指缩放
    document.addEventListener('gesturestart', function(event) {
      event.preventDefault()
    });
  }, [])

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    box.addEventListener('scroll', (event) => {
      const target = event.target as HTMLDivElement;
      setScrollBtn(target.scrollTop > 300);
    });
  }, [boxRef])
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

        <link href="https://fonts.googleapis.com/css?family=Press+Start+2P" rel="stylesheet" />
      </Head>
      <div className={styles.main}>
        {!game_path && (
          <div className={styles.box} ref={boxRef}>
            <div className="nes-field" style={{ margin: '20px 0 20px 0' }}>
              <label htmlFor="name_field">Game name</label>
              <input
                type="text" id="name_field" className="nes-input is-success"
                onInput={(event) => {
                  setGameName(event.currentTarget.value)
                }}
              />
            </div>
            <div className={["nes-container is-dark with-title", styles.gameList].join(' ')}>
              <div className="title">GAMES</div>
              {Object.entries(nes).map(([name, path]) => (!gameName || name.includes(gameName)) ? (
                <button key={name} onClick={() => set_game_path(path)} type="button" className={[styles.gameItem, "nes-btn"].join(' ')}>{name}</button>
              ) : null)}
            </div>
          </div>
        )}
        {game_path && <Emulator path={game_path} />}
      </div>
      <div className={scrollBtn && !game_path ? [styles.scrollTop, 'active'].join(' ') : styles.scrollTop}>
        <button onClick={() => {
          boxRef.current?.scrollTo({ top:0, behavior: 'smooth' });
        }} type="button" className="nes-btn is-error active"><span>&lt;</span></button>
      </div>
    </div>
  )
}
