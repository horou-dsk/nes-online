import * as THREE from 'three'

const angle = -.15, side = -.1;

const nsControlPoints = [
  [
    new THREE.Vector4( -1, -1, angle, 1 ),
    new THREE.Vector4( -1, -.5, side, 1 ),
    new THREE.Vector4( -1, .5, side, 1 ),
    new THREE.Vector4( -1, 1, angle, 1 )
  ],
  [
    new THREE.Vector4( 0, -1, side, 1 ),
    new THREE.Vector4( 0, -.5, 0, 1 ),
    new THREE.Vector4( 0, .5, 0, 1 ),
    new THREE.Vector4( 0, 1, side, 1 )
  ],
  [
    new THREE.Vector4( 1, -1, angle, 1 ),
    new THREE.Vector4( 1, -.5, side, 1 ),
    new THREE.Vector4( 1, .5, side, 1 ),
    new THREE.Vector4( 1, 1, angle, 1 )
  ]
];
const degree1 = 2;
const degree2 = 3;
const knots1 = [ 0, 0, 0, 1, 1, 1 ];
const knots2 = [ 0, 0, 0, 0, 1, 1, 1, 1 ];



export async function getSurfacePointFn() {
  const {NURBSSurface} = await import('three/examples/jsm/curves/NURBSSurface');
  const nurbsSurface = new NURBSSurface( degree1, degree2, knots1, knots2, nsControlPoints );
  return (u: number, v: number, target: THREE.Vector3) => nurbsSurface.getPoint( u, v, target );
}
