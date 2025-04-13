import {chunkSize} from './worldParams.ts';

export const worldToChunkCoords = (x: number, y: number, z: number)=> {
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

export const chunkToWorldCoords = (
  chunkCoords: { x: number; z: number },
  blockCoords: { x: number; y: number; z: number },
) => {
  const x = chunkCoords.x * chunkSize.width + blockCoords.x;
  const y = blockCoords.y;
  const z = chunkCoords.z * chunkSize.width + blockCoords.z;

  return { x, y, z };
};

export const inChunkBounds = (x: number, y: number, z: number) => {
  return x >= 0 && x < chunkSize.width &&
    y >= 0 && y < chunkSize.height &&
    z >= 0 && z < chunkSize.width;
};
