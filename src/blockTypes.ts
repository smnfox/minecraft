import * as THREE from 'three';
import {Block, BlockName, ResourceBlock} from './types';

const textureLoader = new THREE.TextureLoader();

function loadTexture(path: string) {
  const texture = textureLoader.load(path);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

const textures: Record<string, THREE.Texture> = {
  cactusSide: loadTexture('./public/assets/textures/cactus_side.png'),
  cactusTop: loadTexture('./public/assets/textures/cactus_top.png'),
  dirt: loadTexture('./public/assets/textures/dirt.png'),
  grass: loadTexture('./public/assets/textures/grass.png'),
  grassSide: loadTexture('./public/assets/textures/grass_side.png'),
  coalOre: loadTexture('./public/assets/textures/coal_ore.png'),
  ironOre: loadTexture('./public/assets/textures/iron_ore.png'),
  jungleTreeSide: loadTexture('./public/assets/textures/jungle_tree_side.png'),
  jungleTreeTop: loadTexture('./public/assets/textures/jungle_tree_top.png'),
  jungleLeaves: loadTexture('./public/assets/textures/jungle_leaves.png'),
  leaves: loadTexture('./public/assets/textures/leaves.png'),
  treeSide: loadTexture('./public/assets/textures/tree_side.png'),
  treeTop: loadTexture('./public/assets/textures/tree_top.png'),
  sand: loadTexture('./public/assets/textures/sand.png'),
  snow: loadTexture('./public/assets/textures/snow.png'),
  snowSide: loadTexture('./public/assets/textures/snow_side.png'),
  stone: loadTexture('./public/assets/textures/stone.png'),
};

export const blockTypes: Record<BlockName, Block | ResourceBlock> = {
  empty: {
    id: 0,
    name: 'empty',
    visible: false,
    material: null,
  },
  grass: {
    id: 1,
    name: 'grass',
    visible: true,
    material: [
      new THREE.MeshLambertMaterial({ map: textures.grassSide }), // right
      new THREE.MeshLambertMaterial({ map: textures.grassSide }), // left
      new THREE.MeshLambertMaterial({ map: textures.grass }), // top
      new THREE.MeshLambertMaterial({ map: textures.dirt }), // bottom
      new THREE.MeshLambertMaterial({ map: textures.grassSide }), // front
      new THREE.MeshLambertMaterial({ map: textures.grassSide }),  // back
    ],
  },
  dirt: {
    id: 2,
    name: 'dirt',
    visible: true,
    material: new THREE.MeshLambertMaterial({ map: textures.dirt }),
  },
  stone: {
    id: 3,
    name: 'stone',
    visible: true,
    material: new THREE.MeshLambertMaterial({ map: textures.stone }),
    resource: 'stone',
    scale: { x: 30, y: 30, z: 30 },
    scarcity: 0.8,
  },
  coalOre: {
    id: 4,
    name: 'coalOre',
    visible: true,
    material: new THREE.MeshLambertMaterial({ map: textures.coalOre }),
    resource: 'coal',
    scale: { x: 20, y: 20, z: 20 },
    scarcity: 0.8,
  },
  ironOre: {
    id: 5,
    name: 'ironOre',
    visible: true,
    material: new THREE.MeshLambertMaterial({ map: textures.ironOre }),
    resource: 'iron',
    scale: { x: 40, y: 40, z: 40 },
    scarcity: 0.9,
  },
  tree: {
    id: 6,
    name: 'tree',
    visible: true,
    material: [
      new THREE.MeshLambertMaterial({ map: textures.treeSide }), // right
      new THREE.MeshLambertMaterial({ map: textures.treeSide }), // left
      new THREE.MeshLambertMaterial({ map: textures.treeTop }), // top
      new THREE.MeshLambertMaterial({ map: textures.treeTop }), // bottom
      new THREE.MeshLambertMaterial({ map: textures.treeSide }), // front
      new THREE.MeshLambertMaterial({ map: textures.treeSide }),  // back
    ],
  },
  leaves: {
    id: 7,
    name: 'leaves',
    visible: true,
    material: new THREE.MeshLambertMaterial({ map: textures.leaves }),
  },
  sand: {
    id: 8,
    name: 'sand',
    visible: true,
    material: new THREE.MeshLambertMaterial({ map: textures.sand }),
  },
  cloud: {
    id: 9,
    name: 'cloud',
    visible: true,
    material: new THREE.MeshBasicMaterial({ color: 0xf0f0f0 }),
  },
  snow: {
    id: 10,
    name: 'snow',
    visible: true,
    material: [
      new THREE.MeshLambertMaterial({ map: textures.snowSide }), // right
      new THREE.MeshLambertMaterial({ map: textures.snowSide }), // left
      new THREE.MeshLambertMaterial({ map: textures.snow }), // top
      new THREE.MeshLambertMaterial({ map: textures.dirt }), // bottom
      new THREE.MeshLambertMaterial({ map: textures.snowSide }), // front
      new THREE.MeshLambertMaterial({ map: textures.snowSide }),  // back
    ],
  },
  jungleTree: {
    id: 11,
    name: 'jungleTree',
    visible: true,
    material: [
      new THREE.MeshLambertMaterial({ map: textures.jungleTreeSide }), // right
      new THREE.MeshLambertMaterial({ map: textures.jungleTreeSide }), // left
      new THREE.MeshLambertMaterial({ map: textures.jungleTreeTop }),  // top
      new THREE.MeshLambertMaterial({ map: textures.jungleTreeTop }),  // bottom
      new THREE.MeshLambertMaterial({ map: textures.jungleTreeSide }), // front
      new THREE.MeshLambertMaterial({ map: textures.jungleTreeSide }),  // back
    ],
  },
  jungleLeaves: {
    id: 12,
    name: 'jungleLeaves',
    visible: true,
    material: new THREE.MeshLambertMaterial({ map: textures.jungleLeaves }),
  },
  cactus: {
    id: 13,
    name: 'cactus',
    visible: true,
    material: [
      new THREE.MeshLambertMaterial({ map: textures.cactusSide }), // right
      new THREE.MeshLambertMaterial({ map: textures.cactusSide }), // left
      new THREE.MeshLambertMaterial({ map: textures.cactusTop }),  // top
      new THREE.MeshLambertMaterial({ map: textures.cactusTop }),  // bottom
      new THREE.MeshLambertMaterial({ map: textures.cactusSide }), // front
      new THREE.MeshLambertMaterial({ map: textures.cactusSide }),  // back
    ],
  },
  jungleGrass: {
    id: 14,
    name: 'jungleGrass',
    visible: true,
    material: [
      new THREE.MeshLambertMaterial({ color: 0x80c080, map: textures.grassSide }), // right
      new THREE.MeshLambertMaterial({ color: 0x80c080, map: textures.grassSide }), // left
      new THREE.MeshLambertMaterial({ color: 0x80c080, map: textures.grass }), // top
      new THREE.MeshLambertMaterial({ color: 0x80c080, map: textures.dirt }), // bottom
      new THREE.MeshLambertMaterial({ color: 0x80c080, map: textures.grassSide }), // front
      new THREE.MeshLambertMaterial({ color: 0x80c080, map: textures.grassSide }),  // back
    ],
  },
};

export const resources: ResourceBlock[] = [
  blockTypes.stone,
  blockTypes.ironOre,
  blockTypes.coalOre,
] as ResourceBlock[];
