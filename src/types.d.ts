import {InstancedRigidBodyProps} from '@react-three/rapier';
import * as THREE from 'three';

interface ChunkData {
  x: number;
  y: number;
  z: number;
}

export interface BlocksData {
  name: BlockName;
  count: number;
  instances: InstancedRigidBodyProps[];
}

export type BiomeName = 'Tundra' | 'Temperate' | 'Jungle' | 'Desert';
export type BlockName =
  'empty' |
  'grass' |
  'dirt' |
  'tree' |
  'cloud' |
  'coalOre' |
  'ironOre' |
  'jungleTree' |
  'jungleLeaves' |
  'leaves' |
  'sand' |
  'snow' |
  'stone' |
  'cactus' |
  'jungleGrass';
export type ResourceName = 'stone' | 'iron' | 'coal';

export interface Block {
  id: number;
  name: BlockName;
  visible: boolean;
  material: THREE.MeshBasicMaterial | THREE.MeshLambertMaterial | THREE.MeshLambertMaterial[] | null;
}

export interface ResourceBlock extends Block {
  resource: ResourceName;
  scale: THREE.Vector3Like;
  scarcity: number;
}
