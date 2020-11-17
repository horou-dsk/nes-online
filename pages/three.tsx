import React, {useEffect, useRef, useState} from 'react'
import * as THREE from 'three'
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import styles from './three.module.css'

const GLTFLoader = () => import('three/examples/jsm/loaders/GLTFLoader')

function Three() {

  const [dom, setDom] = useState<HTMLCanvasElement | null>(null)

  const mainRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    setDom(renderer.domElement)

    // const geometry = new THREE.BoxGeometry();
    // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    // const cube = new THREE.Mesh( geometry, material );
    // scene.add( cube );

    // White directional light at half intensity shining from the top.
    // const directionalLight = new THREE.DirectionalLight( 0xffffff, 10 );
    // directionalLight.position.set(0, 1, 0);
    // scene.add( directionalLight );

    const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 5 );
    scene.add( light );

    camera.position.z = 5;

    // camera.rotation.y = 1;

    GLTFLoader().then(({GLTFLoader}) => {
      const loader = new GLTFLoader();
      loader.load('/Textures/old_tv/scene.gltf', function (gltf) {
        // gltf.scene.scale.set(10, 10, 10)
        // gltf.scene.scale.multiplyScalar(10)
        console.log(gltf)
        scene.add(gltf.scene)
      }, undefined, function ( error ) {

        console.error( error );

      });
    })

    function animate() {
      requestAnimationFrame( animate );
      // cube.rotation.x += 0.01;
      // cube.rotation.y += 0.01;
      renderer.render( scene, camera );
    }
    animate();
  }, [])

  useEffect(() => {
    if (dom) mainRef.current?.appendChild(dom);
  }, [mainRef, dom])

  return (
    <div className={styles.main} ref={mainRef}>
    </div>
  )
}

export default Three
