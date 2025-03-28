import {create} from 'zustand';
import {persist} from 'zustand/middleware';

interface BlocksState {
  playerBlocks: Map<string, number>;
}

const getKey = (chunkX: number, chunkZ: number, blockX: number, blockY: number, blockZ: number): string => {
  return `${chunkX},${chunkZ},${blockX},${blockY},${blockZ}`;
};

export const setPlayerBlock = (chunkX: number, chunkZ: number, blockX: number, blockY: number, blockZ: number, blockId: number) => {
  const key = getKey(chunkX, chunkZ, blockX, blockY, blockZ);
  useBlocksStore.setState((state) => ({playerBlocks: new Map(state.playerBlocks).set(key, blockId)}));
};

export const getPlayerBlock = (chunkX: number, chunkZ: number, blockX: number, blockY: number, blockZ: number) => {
  const key = getKey(chunkX, chunkZ, blockX, blockY, blockZ);
  return useBlocksStore.getState().playerBlocks.get(key);
};

export const playerBlockExist = (chunkX: number, chunkZ: number, blockX: number, blockY: number, blockZ: number) => {
  const key = getKey(chunkX, chunkZ, blockX, blockY, blockZ);
  return useBlocksStore.getState().playerBlocks.get(key) !== undefined;
};

export const clearPlayerBlocks = () => {
  useBlocksStore.setState(() => ({playerBlocks: new Map()}));
};

export const useBlocksStore = create<BlocksState>()(persist(() => ({
  playerBlocks: new Map(),
}), {name: 'blocks-storage'}));
