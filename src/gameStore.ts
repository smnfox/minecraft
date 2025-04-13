import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import * as THREE from 'three';
import {chunkSize} from './worldParams.ts';

interface GameState {
  playerPosition: THREE.Vector3Like;
  seed: number;
}

export const getPlayerPosition = () => {
  return useGameStore.getState().playerPosition;
};

export const setPlayerPosition = (position: THREE.Vector3Like) => {
  const curPos = useGameStore.getState().playerPosition;
  if (curPos.x === position.x && curPos.z === position.z) {
    return;
  }
  useGameStore.setState(() => ({playerPosition: position}));
};

export const setSeed = (seed: number) => {
  useGameStore.setState(() => ({seed}));
};

export const useGameStore = create<GameState>()(persist(() => ({
  playerPosition: {
    x: 0,
    y: chunkSize.height + 1,
    z: 0,
  },
  seed: 0,
}), {name: 'game-storage'}));
