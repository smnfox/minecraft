import {create} from 'zustand';
import {persist, StorageValue} from 'zustand/middleware';
import {ChunkData} from './types';

const getKey = (chunkX: number, chunkZ: number, blockX: number, blockY: number, blockZ: number): string => {
  return `${chunkX},${chunkZ},${blockX},${blockY},${blockZ}`;
};

export const getPlayerBlock = (chunkX: number, chunkZ: number, blockX: number, blockY: number, blockZ: number) => {
  const key = getKey(chunkX, chunkZ, blockX, blockY, blockZ);
  return useBlocksStore.getState().playerBlocks.get(key);
};

export const playerBlockExist = (chunkX: number, chunkZ: number, blockX: number, blockY: number, blockZ: number) => {
  const key = getKey(chunkX, chunkZ, blockX, blockY, blockZ);
  return useBlocksStore.getState().playerBlocks.get(key) !== undefined;
};

export const setPlayerBlock = (chunkX: number, chunkZ: number, blockX: number, blockY: number, blockZ: number, blockId: number) => {
  const key = getKey(chunkX, chunkZ, blockX, blockY, blockZ);
  useBlocksStore.setState((state) => ({playerBlocks: new Map(state.playerBlocks).set(key, blockId)}));
};

export const clearPlayerBlocks = () => {
  useBlocksStore.setState(() => ({playerBlocks: new Map()}));
};

interface BlocksState {
  playerBlocks: Map<string, number>;
}

interface ChunksState {
  generatedChunks: Map<string, ChunkData>;
}

export const useChunksStore = create<ChunksState>()(() => ({
  generatedChunks: new Map(),
}));

export const useBlocksStore = create<BlocksState>()(persist(() => ({
  playerBlocks: new Map(),
}), {
  name: 'blocks-storage',
  storage: {
    getItem: (name) => {
      const str = localStorage.getItem(name);
      if (!str) return null;
      const existingValue = JSON.parse(str);
      return {
        ...existingValue,
        state: {
          ...existingValue.state,
          playerBlocks: new Map(existingValue.state.playerBlocks),
        },
      };
    },
    setItem: (name, newValue: StorageValue<BlocksState>) => {
      // functions cannot be JSON encoded
      const str = JSON.stringify({
        ...newValue,
        state: {
          ...newValue.state,
          playerBlocks: Array.from(newValue.state.playerBlocks.entries()),
        },
      });
      localStorage.setItem(name, str);
    },
    removeItem: (name) => localStorage.removeItem(name),
  },
}));
