import React, {useEffect, useRef, useState} from 'react'
import * as THREE from 'three'
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import styles from './three.module.css'

const GLTFLoader = () => import('three/examples/jsm/loaders/GLTFLoader')

const ImportOrbitControls = () => import('three/examples/jsm/controls/OrbitControls')

function Three() {

  const [dom, setDom] = useState<HTMLCanvasElement | null>(null)

  const mainRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    const domElem = renderer.domElement
    setDom(domElem)

    // 设置光照
    const ambientLight = new THREE.AmbientLight(0x666666 );
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight( 0xffffff, 5 );
    directionalLight.position.set( 50, 200, 100 );
    directionalLight.position.multiplyScalar( 1.3 );
    scene.add(directionalLight);
    // White directional light at half intensity shining from the top.
    // const directionalLight = new THREE.DirectionalLight( 0xffffff, 10 );
    // directionalLight.position.set(0, 1, 0);
    // scene.add( directionalLight );

    // const light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
    // scene.add( light );

    camera.position.z = 5;

    ImportOrbitControls().then(({ OrbitControls }) => {
      const controls = new OrbitControls( camera, domElem );
      controls.maxPolarAngle = Math.PI;
      controls.minDistance = 1;
      controls.maxDistance = 15;
    })

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

    // const geometry = new THREE.Geometry();
    const texture = new THREE.TextureLoader().load('Textures/wallhaven-n61px0.jpg')
    texture.flipY = true;
    const geometry = new THREE.BufferGeometry();
    const texCoord = new Float32Array([
      0.0,  0.0,
      1.0,  0.0,
      1.0,  1.0,
      1.0,  1.0,
      0.0,  1.0,
      0.0,  0.0
    ])
    const verticesElm = new Float32Array([
      -1.0, -1.0,
      1.0, -1.0,
      -1.0, 1.0,
      -1.0, 1.0,
      1.0, -1.0,
      1.0, 1.0,
    ]);
// create a simple square shape. We duplicate the top left and bottom right
// vertices because each vertex needs to appear once per triangle.
    const vertices = new Float32Array( [
      -1.0, -1.0,  1.0,
      1.0, -1.0,  1.0,
      1.0,  1.0,  1.0,

      1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0,
      -1.0, -1.0,  1.0
    ] );

// itemSize = 3 because there are 3 values (components) per vertex
    geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(texCoord, 2));
    // const geometry = new THREE.BoxGeometry();
    geometry.scale(.6, .48, 1);
    geometry.translate(-0.18, .08, -.25);
    const material = new THREE.MeshBasicMaterial( { map: texture } );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );

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
