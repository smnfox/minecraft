import {chunkSize, drawDistance} from '../worldParams.ts';
import {ChunkData} from '../types';
import {MemoChunk} from './Chunk.tsx';
import * as THREE from 'three';
import {useGameStore} from '../gameStore.ts';
import {useChunksStore} from '../blocksStore.ts';
import {worldToChunkCoords} from '../helpers.ts';
import {generateChunk} from '../terrainGenerator.ts';
import {useFrame} from '@react-three/fiber';
import {useState} from 'react';

const getVisibleChunks = (playerPosition: THREE.Vector3Like) => {
  const visibleChunks = [];

  const coords = worldToChunkCoords(
    playerPosition.x,
    playerPosition.y,
    playerPosition.z,
  );

  const chunkX = coords.chunk.x;
  const chunkZ = coords.chunk.z;

  for (let x = chunkX - drawDistance; x <= chunkX + drawDistance; x++) {
    for (let z = chunkZ - drawDistance; z <= chunkZ + drawDistance; z++) {
      visibleChunks.push({ x: x * chunkSize.width, z: z * chunkSize.width });
    }
  }

  return visibleChunks;
};

const getChunksToAdd = (visibleChunks: {x: number, z: number}[]) => {
  return visibleChunks.filter((chunk) => {
    const chunkExists = chunks.has(`${chunk.x}${chunk.z}`);
    return !chunkExists;
  });
};

const getChunksToRemove = (visibleChunks: {x: number, z: number}[]) => {
  return Array.from(chunks).filter((data) => {
    const chunk = data[1];
    const {x, z} = chunk.pos;
    const chunkExists = visibleChunks
      .find((visibleChunk) => (
        visibleChunk.x === x && visibleChunk.z === z
      ));

    return !chunkExists;
  });
};

const chunks = new Map<string, ChunkData>();
let chunksToAdd: {x: number, z: number}[] = [];
let chunksToRemove: [string, ChunkData][] = [];

export const Game = () => {
  const [renderCount, setRenderCount] = useState(0);

  useFrame(() => {
    if (chunksToRemove.length > 0) {
      const chunk = chunksToRemove.pop();
      if (chunk) {
        chunks.delete(chunk[0]);
      }
      useChunksStore.setState(() => ({generatedChunks: chunks}));
      setRenderCount(renderCount + 1);
      return;
    }

    if (chunksToAdd.length > 0) {
      const chunkCoords = chunksToAdd.pop();
      if (chunkCoords) {
        const chunk = generateChunk({
          x: chunkCoords.x,
          y: 0,
          z: chunkCoords.z,
        });
        const key = `${chunkCoords.x}${chunkCoords.z}`;
        chunks.set(key, chunk);
        useChunksStore.setState(() => ({generatedChunks: chunks}));
      }
      setRenderCount(renderCount + 1);
      return;
    }

    const playerPosition = useGameStore.getState().playerPosition;
    const visibleChunksCoords = getVisibleChunks(playerPosition);
    if (visibleChunksCoords.every((visibleChunk) => {
      return chunks.has(`${visibleChunk.x}${visibleChunk.z}`);
    })) {
      return;
    }

    chunksToRemove = getChunksToRemove(visibleChunksCoords);
    chunksToAdd = getChunksToAdd(visibleChunksCoords);
    setRenderCount(renderCount + 1);
  });

  // const getBlock = (x: number, y: number, z: number)=>  {
  //   const coords = worldToChunkCoords(x, y, z);
  //   const chunk = getChunk(coords.chunk.x, coords.chunk.z);
  //
  //   if (chunk && chunk.loaded) {
  //     return chunk.getBlock(
  //       coords.block.x,
  //       coords.block.y,
  //       coords.block.z
  //     );
  //   } else {
  //     return null;
  //   }
  // }

  // const getChunk = (chunkX: number, chunkZ: number) => {
  //   return threeGroup.children.find((chunk) => (
  //     chunk.userData.x === chunkX &&
  //     chunk.userData.z === chunkZ
  //   ));
  // }

  // const addBlock = (x: number, y: number, z: number, blockId: number) => {
  //   const coords = worldToChunkCoords(x, y, z);
  //   const chunk = getChunk(coords.chunk.x, coords.chunk.z);
  //
  //   if (chunk) {
  //     chunk.addBlock(
  //       coords.block.x,
  //       coords.block.y,
  //       coords.block.z,
  //       blockId
  //     );
  //
  //     // Hide neighboring blocks if they are completely obscured
  //     hideBlock(x - 1, y, z);
  //     hideBlock(x + 1, y, z);
  //     hideBlock(x, y - 1, z);
  //     hideBlock(x, y + 1, z);
  //     hideBlock(x, y, z - 1);
  //     hideBlock(x, y, z + 1);
  //   }
  // }
  //
  // const removeBlock = (x: number, y: number, z: number) => {
  //   const coords = worldToChunkCoords(x, y, z);
  //   const chunk = getChunk(coords.chunk.x, coords.chunk.z);
  //
  //   // Don't allow removing the first layer of blocks
  //   if (coords.block.y === 0) return;
  //
  //   if (chunk) {
  //     chunk.removeBlock(
  //       coords.block.x,
  //       coords.block.y,
  //       coords.block.z
  //     );
  //
  //     // Reveal adjacent neighbors if they are hidden
  //     revealBlock(x - 1, y, z);
  //     revealBlock(x + 1, y, z);
  //     revealBlock(x, y - 1, z);
  //     revealBlock(x, y + 1, z);
  //     revealBlock(x, y, z - 1);
  //     revealBlock(x, y, z + 1);
  //   }
  // }

  // const revealBlock = (x: number, y: number, z: number) => {
  //   const coords = worldToChunkCoords(x, y, z);
  //   const chunk = getChunk(coords.chunk.x, coords.chunk.z);
  //
  //   if (chunk) {
  //     chunk.addBlockInstance(
  //       coords.block.x,
  //       coords.block.y,
  //       coords.block.z
  //     )
  //   }
  // }
  //
  // const hideBlock = (x: number, y: number, z: number) => {
  //   const coords = worldToChunkCoords(x, y, z);
  //   const chunk = getChunk(coords.chunk.x, coords.chunk.z);
  //
  //   if (chunk && chunk.isBlockObscured(coords.block.x, coords.block.y, coords.block.z)) {
  //     chunk.deleteBlockInstance(
  //       coords.block.x,
  //       coords.block.y,
  //       coords.block.z
  //     )
  //   }
  // }

  return (
    <>
      {Array.from(chunks).map(([chunkId, chunk]) =>
        <MemoChunk chunkX={chunk.pos.x} chunkY={chunk.pos.y} chunkZ={chunk.pos.z} key={chunkId} />,
      )}
    </>
  );
};
