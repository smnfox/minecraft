import {drawDistance, chunkSize} from '../worldParams.ts';
import {useEffect, useState} from 'react';
import {ChunkData} from '../types';
import {MemoChunk} from './Chunk.tsx';
import * as THREE from 'three';
import {useGameStore} from '../gameStore.ts';
import {useShallow} from 'zustand/react/shallow';

const worldToChunkCoords = (x: number, y: number, z: number)=> {
  const chunkCoords = {
    x: Math.floor(x / chunkSize.width),
    z: Math.floor(z / chunkSize.width),
  };

  const blockCoords = {
    x: x - chunkSize.width * chunkCoords.x,
    y,
    z: z - chunkSize.width * chunkCoords.z,
  };

  return {
    chunk: chunkCoords,
    block: blockCoords,
  };
};

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
      visibleChunks.push({ x, z });
    }
  }

  return visibleChunks;
};

export const Game = () => {
  const [chunks, setChunks] = useState<ChunkData[]>([]);
  const playerPosition = useGameStore(useShallow((state) => state.playerPosition));
  //const playerPosition = useGameStore.getState().playerPosition;
  //console.log('render Game component');

  useEffect(() => {
    const visibleChunks = getVisibleChunks(playerPosition);

    const tempChunks: ChunkData[] = visibleChunks.map((chunk) => {
      return {
        x: chunk.x * chunkSize.width,
        y:  0,
        z: chunk.z * chunkSize.width,
      };
    });
    if (!tempChunks.every((tempChunk) => chunks.some((chunk) => {
      return chunk.x === tempChunk.x && chunk.z === tempChunk.z;
    }))) {
      setChunks(tempChunks);
    }
  }, [playerPosition]);

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
      {chunks.map((chunk) =>
        <MemoChunk chunkX={chunk.x} chunkY={chunk.y} chunkZ={chunk.z} key={`${chunk.x}${chunk.z}`} />,
      )}
    </>
  );
};
