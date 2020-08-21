import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react'
import styles from './game.module.css'
const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 240;

function CanvasScreen(props: any, ref: ((instance: unknown) => void) | React.RefObject<unknown> | null | undefined) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [context, setContext] = useState<CanvasRenderingContext2D>()
  const render = (imageData: ImageData) => {
    context?.putImageData(imageData, 0, 0)
  }
  useEffect(() => {
    const context = canvasRef.current?.getContext('2d')
    if (context) setContext(context)
  }, [])
  useImperativeHandle(ref, () => ({
    render,
  }))
  return (
    <canvas
      className={styles.glScreen}
      width={SCREEN_WIDTH}
      height={SCREEN_HEIGHT}
      ref={canvasRef}
    />
  )
}

export default forwardRef(CanvasScreen)
