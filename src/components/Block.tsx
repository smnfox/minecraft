import * as THREE from 'three';
import {blockTypes} from '../blockTypes.ts';
import {chunkSize} from '../worldParams.ts';
import {InstancedRigidBodies, InstancedRigidBodyProps} from '@react-three/rapier';
import {BlockName} from '../types';
import {useRef} from 'react';

const geometry = new THREE.BoxGeometry();
const maxCount = chunkSize.width * chunkSize.width * chunkSize.height;

interface BlockProps {
  blockName: BlockName;
  count: number;
  instances: InstancedRigidBodyProps[];
}

export const Block = ({ blockName, count, instances }: BlockProps) => {
  const block = blockTypes[blockName];
  const mesh = useRef<THREE.InstancedMesh>(null);

  if (!block.visible || !block.material) {
    return null;
  }

  setTimeout(() => {
    //todo do it after chunk generates
    mesh.current?.computeBoundingSphere();
  }, 1000);

  return (
    <InstancedRigidBodies
      instances={instances}
      colliders="cuboid"
      type="fixed"
    >
      <instancedMesh
        ref={mesh}
        args={[geometry, block.material, maxCount]}
        name={blockName}
        count={count}
      ></instancedMesh>
    </InstancedRigidBodies>
  );
};
