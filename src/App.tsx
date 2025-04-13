import './App.css';
import { Canvas } from '@react-three/fiber';
import {KeyboardControls, PointerLockControls} from '@react-three/drei';
import {create} from 'zustand';
import {Physics} from '@react-three/rapier';
import {Player} from './components/Player.tsx';
import { Stats } from '@react-three/drei';
import {Game} from './components/Game.tsx';
import {setSeed, useGameStore} from './gameStore.ts';
import * as THREE from 'three';
import {chunkSize, drawDistance} from './worldParams.ts';

const usePointerLockControlsStore = create(() => ({
  isLock: false,
}));

const skyColor = new THREE.Color().setHex(0x80a0e0);

export default function App() {
  const seed = useGameStore.getState().seed;
  if (!seed || isNaN(seed)) {
    setSeed(Math.floor((Math.random() * 1000)));
  }

  const pointerLockControlsLockHandler = () => {
    usePointerLockControlsStore.setState({ isLock: true });
  };

  const pointerLockControlsUnlockHandler = () => {
    usePointerLockControlsStore.setState({ isLock: false });
  };

  return (
    <KeyboardControls map={[
      { name: 'forward', keys: ['ArrowUp', 'w', 'W', 'KeyW'] },
      { name: 'backward', keys: ['ArrowDown', 's', 'S', 'KeyS'] },
      { name: 'left', keys: ['ArrowLeft', 'a', 'A', 'KeyA'] },
      { name: 'right', keys: ['ArrowRight', 'd', 'D', 'KeyD'] },
      { name: 'jump', keys: ['Space'] },
    ]}>
      <Canvas scene={{background: skyColor}}>
        <PointerLockControls onLock={pointerLockControlsLockHandler} onUnlock={pointerLockControlsUnlockHandler} />
        <fog attach="fog" args={[0x80a0e0, chunkSize.width * (drawDistance - 1), chunkSize.width * drawDistance]} />
        <ambientLight intensity={0.8} />
        <directionalLight
          intensity={1.5}
          position={[50, 50, 50]}
        />
        <Physics gravity={[0, -20, 0]}>
          <Game />
          <Player />
        </Physics>
        <Stats />
      </Canvas>
    </KeyboardControls>
  );
}
