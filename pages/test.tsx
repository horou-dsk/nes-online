import React, {useEffect, useState} from 'react'
import Head from 'next/head'

function Test() {
  const [fps, setFps] = useState(0)
  useEffect(() => {
    let fps = 0
    let interval = 1e3 / 60.98
    let stop = false
    setInterval(() => {
      setFps(fps)
      fps = 0
      // stop = true
    }, 1000)
    let now = Date.now()
    let lastFrameTime = 0
    const step = () => {
      const time = Date.now() - now
      // if (stop) return setFps()
      requestAnimationFrame(step)
      let excess = time % interval;
      let newFrameTime = time - excess
      if (!lastFrameTime) lastFrameTime = newFrameTime
      let numFrames = Math.round(
        (newFrameTime - lastFrameTime) / interval
      )
      if (numFrames < 1) return
      fps ++
      lastFrameTime += interval
    }
    requestAnimationFrame(step)
  }, [])
  // useEffect(() => {
  //   let buffer = [1, 23, 262, 23, 25, 0]
  //   for (let i = 0; i < buffer.length; i++) {
  //     console.log(buffer.shift())
  //   }
  // }, [])
  return (
    <div>
      <Head>
        <title>帧率测试</title>
      </Head>
      <div className={'main'}>
        <div>FPS:{fps}</div>
      </div>
      <style jsx>
        {`
        .main {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 19px;
          font-weight: bold;
        }
        `}
      </style>
    </div>
  )
}

export default Test
