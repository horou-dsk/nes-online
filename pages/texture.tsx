import React, {useEffect, useRef, useState} from 'react'
import styles from './three.module.css'
import * as THREE from 'three'

const GLTFLoader = () => import('three/examples/jsm/loaders/GLTFLoader')

const ImportOrbitControls = () => import('three/examples/jsm/controls/OrbitControls')

const SCREEN_WIDTH = 256 * 4;
const SCREEN_HEIGHT = 240 * 4;

function Texture() {

  const [dom, setDom] = useState<HTMLCanvasElement | null>(null)

  const mainRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const init = async () => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );

      const renderer = new THREE.WebGLRenderer();
      renderer.setSize( window.innerWidth, window.innerHeight );
      const domElem = renderer.domElement
      setDom(domElem)

      // 设置环境光照
      const ambientLight = new THREE.AmbientLight(0x666666 );
      scene.add(ambientLight);

      const {OrbitControls} = await ImportOrbitControls();
      const controls = new OrbitControls( camera, domElem );
      controls.maxPolarAngle = Math.PI;
      controls.minDistance = 1;
      controls.maxDistance = 15;

      const dataTexture = new THREE.DataTexture(
        new ImageData(SCREEN_WIDTH, SCREEN_HEIGHT).data,
        SCREEN_WIDTH,
        SCREEN_HEIGHT,
        THREE.RGBAFormat,
        THREE.UnsignedByteType
      );
      // dataTexture.unpackAlignment = 4;
      dataTexture.flipY = true;
      // dataTexture.internalFormat = 'RGBA';
      // const gl = renderer.getContext();
      // console.log(gl.RGBA, gl.UNSIGNED_BYTE, gl.TEXTURE_2D);

      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial( { map: dataTexture } );
      const cube = new THREE.Mesh( geometry, material );
      scene.add( cube );

      function animate() {
        requestAnimationFrame( animate );
        // cube.rotation.x += 0.01;
        // cube.rotation.y += 0.01;
        renderer.render( scene, camera );
      }
      animate();
    };
    init();
  }, [])

  useEffect(() => {
    if (dom) mainRef.current?.appendChild(dom);
  }, [mainRef, dom])

  return (
    <div className={styles.main} ref={mainRef}>
    </div>
  )
}

export default Texture