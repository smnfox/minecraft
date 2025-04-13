import * as THREE from 'three';
import {Vector2, Vector3Like} from 'three';

type Terrain = Array<Array<Array<{
  id: number;
  instanceId: number | null;
}>>>;

interface BlockData {
  key: string;
  position: [number, number, number];
  name: BlockName;
  sides: {
    hasAbove: boolean,
    hasBelow: boolean,
    hasLeft: boolean,
    hasRight: boolean,
    hasFront: boolean,
    hasBehind: boolean,
  },
}

interface ChunkData {
  pos: Vector3Like;
  countBlocks: number;
  solidBlocks: BlockData[];
  clouds: BlockData[];
  water: BlockData[];
  terrainData?: Terrain;
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
  'jungleGrass' |
  'water';
export type ResourceName = 'stone' | 'iron' | 'coal';

interface TexturePoint {
  leftTop: Vector2,
  leftBottom: Vector2,
  rightTop: Vector2,
  rightBottom: Vector2,
}

export interface Block {
  id: number;
  name: BlockName;
  visible: boolean;
  material?: THREE.MeshBasicMaterial | THREE.MeshLambertMaterial | THREE.MeshLambertMaterial[];
  withRigidBody: boolean;
  texturePoints?: {
    right: TexturePoint,
    left: TexturePoint,
    top: TexturePoint,
    bottom: TexturePoint,
    front: TexturePoint,
    back: TexturePoint,
  }
}

export interface ResourceBlock extends Block {
  resource: ResourceName;
  scale: THREE.Vector3Like;
  scarcity: number;
}
