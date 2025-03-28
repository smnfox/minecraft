import {RigidBody} from '@react-three/rapier';
import * as THREE from 'three';
import {chunkSize} from '../worldParams.ts';

const waterMaterial = new THREE.MeshLambertMaterial({
  color: 0x9090e0,
  transparent: true,
  opacity: 0.5,
  side: THREE.DoubleSide,
});

export const Ground = () => {
  return (
    <RigidBody type="fixed">
      <mesh material={waterMaterial}>
        <boxGeometry args={[chunkSize.width, chunkSize.height, chunkSize.width]} />
      </mesh>
    </RigidBody>
  );
};