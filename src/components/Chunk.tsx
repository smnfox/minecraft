import {memo, useMemo} from 'react';
import {atlasMaterial, blockTypes} from '../blockTypes.ts';
import {useChunksStore} from '../blocksStore.ts';
import {Instance, Instances} from '@react-three/drei';
import {RigidBody} from '@react-three/rapier';
import {ChunkData} from '../types';
import {inChunkBounds} from '../helpers.ts';
import {chunkSize} from '../worldParams.ts';
import {getBlock} from '../terrainGenerator.ts';
import {generatePoints} from '../meshGenerator.ts';
import * as THREE from 'three';

interface ChunkProps {
  chunkX: number;
  chunkY: number;
  chunkZ: number;
}

const getBlockInWorld = (x: number, y: number, z: number, chunkData: ChunkData) => {
  if (inChunkBounds(x, y, z)) {
    return getBlock(x, y, z, chunkData);
  }
  const otherChunkCoords = {x: chunkData.pos.x, z: chunkData.pos.z};
  const blockCoords = {x, y, z};
  if (x < 0) {
    otherChunkCoords.x = chunkData.pos.x - 1;
    blockCoords.x = chunkSize.width - 1;
  } else if (x >= chunkSize.width) {
    otherChunkCoords.x = chunkData.pos.x + 1;
    blockCoords.x = 0;
  } else if (z < 0) {
    otherChunkCoords.z = chunkData.pos.z + 1;
    blockCoords.z = 0;
  } else if (z >= chunkSize.width) {
    otherChunkCoords.z = chunkData.pos.z - 1;
    blockCoords.z = chunkSize.width - 1;
  }
  const chunk = useChunksStore.getState().generatedChunks.get(`${otherChunkCoords.x}${otherChunkCoords.z}`);
  if (chunk && chunk.terrainData) {
    return chunk.terrainData[blockCoords.x][blockCoords.y][blockCoords.z];
  }
  return null;
};

const Chunk = ({chunkX, chunkY, chunkZ}: ChunkProps) => {
  const chunkData = useMemo(() =>
    useChunksStore.getState().generatedChunks.get(`${chunkX}${chunkZ}`),
    [chunkX, chunkZ],
  );

  if (!chunkData) {
    return null;
  }

  const visibleBlocks = [];
  for (const block of (chunkData?.solidBlocks || [])) {
    const [x, y, z] = block.position;
    block.sides.hasAbove = !!getBlock(x, y + 1, z, chunkData)?.id;
    block.sides.hasBelow = !!getBlock(x, y - 1, z, chunkData)?.id;
    block.sides.hasLeft = !!getBlockInWorld(x - 1, y, z, chunkData)?.id;
    block.sides.hasRight = !!getBlockInWorld(x + 1, y, z, chunkData)?.id;
    block.sides.hasFront = !!getBlockInWorld(x, y, z + 1, chunkData)?.id;
    block.sides.hasBehind = !!getBlockInWorld(x, y, z - 1, chunkData)?.id;

    if (!block.sides.hasAbove ||
      (!block.sides.hasBelow && y < 1) ||
      !block.sides.hasLeft ||
      !block.sides.hasRight ||
      !block.sides.hasFront ||
      !block.sides.hasBehind
    ) {
      visibleBlocks.push(block);
    }
  }

  const bodyPoints = generatePoints(visibleBlocks);
  const vertices = new Float32Array(bodyPoints.vertices);
  const uvs = new Float32Array(bodyPoints.uvs);
  const bodyGeometry = new THREE.BufferGeometry();
  bodyGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  bodyGeometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  bodyGeometry.computeVertexNormals();
  bodyGeometry.computeBoundingBox();

  // const deleteBlockInstance = (x: number, y: number, z: number) => {
  //   const block = getBlock(x, y, z);
  //   if (!block || block.id === blockTypes.empty.id || block.instanceId === null) return;
  //
  //   // Get the mesh and instance id of the block
  //   const blockData = blocksData.get(block.id);
  //   if (!blockData) {
  //     console.error('Cant find block data: ', block.id);
  //     return;
  //   }
  //   const instanceId = block.instanceId;
  //   const instanceIndex = blockData.instances.findIndex((instance) => instance.key === instanceId);
  //   if (instanceIndex > -1) {
  //     blockData.instances.splice(instanceIndex, 1);
  //   }
  //
  //   // This effectively removes the last instance from the scene
  //   blockData.count--;
  //
  //   // todo need to do this in Block.tsx when something changes?
  //   // Notify the instanced mesh we updated the instance matrix
  //   // Also re-compute the bounding sphere so raycasting works
  //   // mesh.instanceMatrix.needsUpdate = true;
  //   // mesh.computeBoundingSphere();
  //
  //   // Remove the instance associated with the block and update the data model
  //   setBlockInstanceId(x, y, z, null);
  // }
  //
  // const addBlockInstance = (x: number, y: number, z: number) => {
  //   const block = getBlock(x, y, z);
  //
  //   // Verify the block exists, it isn't an empty block type, and it doesn't already have an instance
  //   if (block && block.id !== blockTypes.empty.id && block.instanceId === null) {
  //     const blockData = blocksData.get(block.id);
  //     if (!blockData) {
  //       console.error('Cant find block data: ', block.id);
  //       return;
  //     }
  //     const instanceId = blockData.count++;
  //     blockData.instances.push({
  //       key: instanceId,
  //       position: [x, y, z],
  //     });
  //     setBlockInstanceId(x, y, z, instanceId);
  //   }
  // }

  // const addBlock = (x: number, y: number, z: number, blockId: number, chunkPosition: THREE.Vector3Like)=> {
  //   const block = getBlock(x, y, z);
  //   if (block && block.id === blockTypes.empty.id) {
  //     setBlockId(x, y, z, blockId);
  //     addBlockInstance(x, y, z);
  //     setPlayerBlock(chunkPosition.x, chunkPosition.z, x, y, z, blockId);
  //   }
  // }
  //
  // const removeBlock = (x: number, y: number, z: number, chunkPosition: THREE.Vector3Like) => {
  //   const block = getBlock(x, y, z);
  //   if (block && block.id !== blockTypes.empty.id) {
  //     deleteBlockInstance(x, y, z);
  //     setBlockId(x, y, z, blockTypes.empty.id);
  //     setPlayerBlock(chunkPosition.x, chunkPosition.z, x, y, z, blockTypes.empty.id);
  //   }
  // }

  return (
    <group position={[chunkX, chunkY, chunkZ]}>
      <Instances
        limit={(chunkData?.clouds.length || 0) + 1}
        material={blockTypes['cloud'].material}
        count={(chunkData?.clouds.length || 0) + 1}
        name={`${chunkX}${chunkZ}cloud`}
      >
        <boxGeometry />
        {chunkData?.clouds.map((instance) => (
          <Instance position={instance.position} key={instance.key}/>
        ))}
      </Instances>
      <Instances
        limit={(chunkData?.water.length || 0) + 1}
        material={blockTypes['water'].material}
        count={(chunkData?.water.length || 0) + 1}
        name={`${chunkX}${chunkZ}water`}
      >
        <boxGeometry />
        {chunkData?.water.map((instance) => (
          <Instance position={instance.position} key={instance.key}/>
        ))}
      </Instances>
      <RigidBody
        colliders="trimesh"
        type="fixed"
      >
        <mesh
          geometry={bodyGeometry}
          material={atlasMaterial}
        />
      </RigidBody>
    </group>
  );
};

export const MemoChunk = memo(Chunk);
