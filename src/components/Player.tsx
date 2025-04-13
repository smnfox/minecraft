import * as THREE from 'three';
import * as RAPIER from '@dimforge/rapier3d-compat';
import {QueryFilterFlags} from '@dimforge/rapier3d-compat';
import {CapsuleCollider, RigidBody, useRapier} from '@react-three/rapier';
import {RefObject, useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {getPlayerPosition, setPlayerPosition} from '../gameStore.ts';
import {useKeyboardControls} from '@react-three/drei';
import {chunkSize} from '../worldParams.ts';

const MOVE_SPEED = 4;
const direction = new THREE.Vector3();
const frontVector = new THREE.Vector3();
const sideVector = new THREE.Vector3();

export const Player = () => {
  const playerRef: RefObject<RAPIER.RigidBody | null> = useRef(null);
  const [, get] = useKeyboardControls();
  const storePos = getPlayerPosition();
  const startPosition = {x: storePos.x, y: chunkSize.height + 100, z: storePos.z};

  const rapier = useRapier();

  useFrame((state) => {
    if (!playerRef.current) return;
    const { forward, backward, left, right, jump } = get();

    // moving player
    const velocity = playerRef.current.linvel();

    frontVector.set(0, 0, Number(backward) - Number(forward));
    sideVector.set(Number(left) - Number(right), 0, 0);
    direction.subVectors(frontVector, sideVector).normalize().multiplyScalar(MOVE_SPEED).applyEuler(state.camera.rotation);

    playerRef.current.setLinvel({ x: direction.x, y: velocity.y, z: direction.z }, true);

    // jumping
    const world: RAPIER.World = rapier.world;
    const ray = world.castRay(new RAPIER.Ray(playerRef.current.translation(), { x: 0, y: -1, z: 0 }), 1.5, false, QueryFilterFlags.ONLY_FIXED);
    const grounded = ray && ray.collider && Math.abs(ray.timeOfImpact) <= 1.5;

    if (jump && grounded) doJump();

    // moving camera
    const {x, y, z} = playerRef.current.translation();
    state.camera.position.set(x, y, z);
    const fixedPosition = {
      x: Math.floor(x),
      y: Math.floor(y),
      z: Math.floor(z),
    };
    setPlayerPosition({x: fixedPosition.x, y: fixedPosition.y, z: fixedPosition.z});
  });

  const doJump = () => {
    if (!playerRef.current) return;

    playerRef.current.setLinvel({x: 0, y: 8, z: 0}, true);
  };

  return (
    <RigidBody
      position={[startPosition.x, startPosition.y, startPosition.z]}
      colliders={false}
      mass={1}
      ref={playerRef}
      lockRotations
    >
      <mesh>
        <capsuleGeometry args={[0.5, 0.5]}/>
        <CapsuleCollider args={[0.75, 0.5]} />
      </mesh>
    </RigidBody>
  );
};
