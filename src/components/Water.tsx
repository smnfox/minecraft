import * as THREE from 'three';
import {chunkSize, params} from '../worldParams.ts';

const waterMaterial = new THREE.MeshLambertMaterial({
  color: 0x9090e0,
  transparent: true,
  opacity: 0.5,
  side: THREE.DoubleSide,
});
const waterGeometry = new THREE.PlaneGeometry();

export const Water = () => {
  return (
    <mesh
      geometry={waterGeometry}
      material={waterMaterial}
      position={[
        chunkSize.width / 2,
        params.terrain.waterOffset + 0.4,
        chunkSize.width / 2,
      ]}
      rotation={[(-Math.PI / 2.0), 0, 0]}
      scale={[chunkSize.width, chunkSize.height, 1]}
      layers={[1]}
    ></mesh>
  );
};
