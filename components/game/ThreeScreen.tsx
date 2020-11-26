import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from 'react'
import * as THREE from 'three'
import styles from './game.module.css'
import vertex from './shader/three-crt/vertex.glsl'
import fragment from './shader/three-crt/fragment.glsl'
import {getSurfacePointFn} from './NurbsSurface'

const ImportGLTFLoader = () => import('three/examples/jsm/loaders/GLTFLoader')

const ImportOrbitControls = () => import('three/examples/jsm/controls/OrbitControls')

const SCREEN_WIDTH = 256 * 4;
const SCREEN_HEIGHT = 240 * 4;

function ThreeScreen(props: any, ref: ((instance: unknown) => void) | React.RefObject<unknown> | null | undefined) {

  const [dom, setDom] = useState<HTMLCanvasElement | null>(null)

  const mainRef = useRef<HTMLDivElement | null>(null)

  const [texture, setTexture] = useState<THREE.DataTexture | null>();

  const [material, setMaterial] = useState<THREE.ShaderMaterial | null>();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const init = async (background_texture?: THREE.Texture) => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const wgl2 = canvas.getContext('webgl2', { antialias: true });
      if (!wgl2) return;
      const scene = new THREE.Scene();
      // scene.background = background_texture;

      const cubeRenderTarget = new THREE.WebGLCubeRenderTarget( 256, {
        format: THREE.RGBFormat,
        generateMipmaps: true,
        minFilter: THREE.LinearMipmapLinearFilter,
        encoding: THREE.sRGBEncoding // temporary -- to prevent the material's shader from recompiling every frame
      } );

      const cubeCamera1 = new THREE.CubeCamera( 1, 1000, cubeRenderTarget );

      const camera = new THREE.PerspectiveCamera( 45, SCREEN_WIDTH / SCREEN_HEIGHT, 0.1, 1000 );

      const renderer = new THREE.WebGLRenderer({ canvas, context: wgl2 });
      // renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
      const domElem = canvas;
      // domElem.style.width = "100%";
      // domElem.style.height = "auto";
      // setDom(domElem);

      // 设置光照
      const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1 );
      scene.add(ambientLight);

      const directionalLight = new THREE.PointLight( 0xFFFFFF, 4, 300, .5 );
      directionalLight.position.set( 25, 100, 50 );
      directionalLight.position.multiplyScalar( 1.3 );
      scene.add(directionalLight);

      camera.position.z = 3;

      ImportOrbitControls().then(({ OrbitControls }) => {
        const controls = new OrbitControls( camera, domElem );
        controls.maxPolarAngle = Math.PI;
        controls.minDistance = 1;
        controls.maxDistance = 16;
      });

      const dataTexture = new THREE.DataTexture(
        new ImageData(SCREEN_WIDTH, SCREEN_HEIGHT).data, SCREEN_WIDTH, SCREEN_HEIGHT
      );
      dataTexture.flipY = true;
      // dataTexture.needsUpdate = true;

      const {GLTFLoader} = await ImportGLTFLoader();
      const loader = new GLTFLoader();
      // let tv_material: THREE.MeshStandardMaterial;
      loader.load('/Textures/try/try.gltf', function (gltf) {
        const model = gltf.scene;
        model.scale.multiplyScalar(7);
        scene.add(model)
        // model.traverse((n) => {
        //   const mesh = n as THREE.Mesh<THREE.Geometry, THREE.MeshStandardMaterial>;
        //   if(mesh.isMesh && !tv_material) {
        //     tv_material = mesh.material;
        //   }
        // })
        // model.traverse((n) => {
        //   const mesh = n as THREE.Mesh<THREE.Geometry, THREE.MeshStandardMaterial>;
        //   if(mesh.isMesh) {
        //     if (mesh.name === 'defaultMaterial_3') {
        //       mesh.scale.multiplyScalar(0);
        //     }
        //   }
        // })
        setTexture(dataTexture);
      }, undefined, function ( error ) {
        console.error( error );
      });
      /*loader.load('/Textures/old_tv/scene.gltf', function (gltf) {
        const model = gltf.scene
        model.traverse((n) => {
          const mesh = n as THREE.Mesh<THREE.Geometry, THREE.MeshStandardMaterial>;
          if(mesh.isMesh) {
            if (mesh.name === 'defaultMaterial_3') {
              mesh.material.opacity = .2;
              mesh.material.transparent = true;
              scene.add(mesh);
            }
          }
        })
      }, undefined, err => {})*/

      // 图片取值坐标
      const texCoord = new Float32Array([
        0.0,  0.0,
        1.0,  0.0,
        1.0,  1.0,
        1.0,  1.0,
        0.0,  1.0,
        0.0,  0.0
      ]);
      // 贴图顶点坐标
      const vertices = new Float32Array( [
        -1.0, -1.0,  1.0,
        1.0, -1.0,  1.0,
        1.0,  1.0,  1.0,

        1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0, -1.0,  1.0
      ] );
      // const texture = new THREE.TextureLoader().load('Textures/wallhaven-n61px0.jpg')
      // const geometry = new THREE.BufferGeometry();
      // geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
      // geometry.setAttribute('uv', new THREE.Float32BufferAttribute(texCoord, 2));
      const getSurfacePoint = await getSurfacePointFn();
      const geometry = new THREE.ParametricBufferGeometry(getSurfacePoint, 16, 16);
      geometry.scale(.64, .50, 1);
      // geometry.scale(.1, .1, .1);
      geometry.translate(-0.19, .1, .75);
      // const geometry = new THREE.BoxGeometry();
      // const material = new THREE.MeshBasicMaterial();
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 1.0 },
          Texture: { value: dataTexture },
        },
        vertexShader: vertex,
        fragmentShader: fragment,
      });
      material.glslVersion = THREE.GLSL3;
      // material.needsUpdate = true;
      setMaterial(material);
      const cube = new THREE.Mesh( geometry, material );
      scene.add( cube );

      function animate() {
        requestAnimationFrame( animate );
        // cube.rotation.x += 0.01;
        // cube.rotation.y += 0.01;
        // cubeCamera1.update( renderer, scene );
        // if (tv_material) tv_material.envMap = cubeRenderTarget.texture;
        renderer.render( scene, camera );
      }
      animate();
    }
    /*const textureLoader = new THREE.TextureLoader();
    textureLoader.load('Textures/2294472375_24a3b8ef46_o.jpg', function (texture) {
      texture.encoding = THREE.sRGBEncoding;
      texture.mapping = THREE.EquirectangularReflectionMapping;
      init(texture);
    })*/
    init();
  }, [canvasRef]);

  const render = (imageData: ImageData) => {
    if (texture && material) {
      texture.image = imageData;
      texture.needsUpdate = true;
      // const texture = new THREE.DataTexture(imageData.data, 256, 240);
      // material.uniforms.Texture.value = texture;
      // material.map = texture;
      // material.needsUpdate = true;
    }

  }

  useImperativeHandle(ref, () => ({
    render,
  }))

    useEffect(() => {
    if (dom) mainRef.current?.appendChild(dom);
  }, [mainRef, dom])

  /*return (
    <div style={{ width: '100%', height: '100%' }}  ref={mainRef}>

    </div>
  )*/

  return (
    <canvas
      className={styles.glScreen}
      width={SCREEN_WIDTH}
      height={SCREEN_HEIGHT}
      ref={canvasRef}
    />
  )
}

export default forwardRef(ThreeScreen)
