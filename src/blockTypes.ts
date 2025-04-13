import * as THREE from 'three';
import {Block, BlockName, ResourceBlock} from './types';
import cactus_side from './assets/textures/cactus_side.png';
import cactus_top from './assets/textures/cactus_top.png';
import dirt from './assets/textures/dirt.png';
import grass from './assets/textures/grass.png';
import grass_side from './assets/textures/grass_side.png';
import coal_ore from './assets/textures/coal_ore.png';
import iron_ore from './assets/textures/iron_ore.png';
import jungle_tree_side from './assets/textures/jungle_tree_side.png';
import jungle_tree_top from './assets/textures/jungle_tree_top.png';
import jungle_leaves from './assets/textures/jungle_leaves.png';
import leaves from './assets/textures/leaves.png';
import tree_side from './assets/textures/tree_side.png';
import tree_top from './assets/textures/tree_top.png';
import sand from './assets/textures/sand.png';
import snow from './assets/textures/snow.png';
import snow_side from './assets/textures/snow_side.png';
import stone  from './assets/textures/stone.png';
import atlas from './assets/textures/atlas.png';
import {texturesCoords, texturesMeta} from './textureAtlas.ts';

const normalizedAtlasWidth = 1 / texturesMeta.w;
const normalizedAtlasHeight = 1 / texturesMeta.h;

const normalizeAtlasCoordinate = (x: number, y: number)=>  {
  return new THREE.Vector2(x * normalizedAtlasWidth, 1 - y * normalizedAtlasHeight);
};

const getTexturePoints = (name: string) => {
  return {
    leftTop: normalizeAtlasCoordinate(texturesCoords[name].x + 0.15, texturesCoords[name].y + 0.15),
    leftBottom: normalizeAtlasCoordinate(texturesCoords[name].x + 0.15, (texturesCoords[name].y + texturesCoords[name].h) - 0.15),
    rightTop: normalizeAtlasCoordinate((texturesCoords[name].x + texturesCoords[name].w) - 0.15, texturesCoords[name].y + 0.15),
    rightBottom: normalizeAtlasCoordinate((texturesCoords[name].x + texturesCoords[name].w) - 0.15, (texturesCoords[name].y + texturesCoords[name].h) - 0.15),
  };
};

const textureLoader = new THREE.TextureLoader();

function loadTexture(path: string) {
  const texture = textureLoader.load(path);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  return texture;
}

const textures: Record<string, THREE.Texture> = {
  cactusSide: loadTexture(cactus_side),
  cactusTop: loadTexture(cactus_top),
  dirt: loadTexture(dirt),
  grass: loadTexture(grass),
  grassSide: loadTexture(grass_side),
  coalOre: loadTexture(coal_ore),
  ironOre: loadTexture(iron_ore),
  jungleTreeSide: loadTexture(jungle_tree_side),
  jungleTreeTop: loadTexture(jungle_tree_top),
  jungleLeaves: loadTexture(jungle_leaves),
  leaves: loadTexture(leaves),
  treeSide: loadTexture(tree_side),
  treeTop: loadTexture(tree_top),
  sand: loadTexture(sand),
  snow: loadTexture(snow),
  snowSide: loadTexture(snow_side),
  stone: loadTexture(stone),
};

export const atlasMaterial = new THREE.MeshLambertMaterial({ map: loadTexture(atlas) });

export const blockTypes: Record<BlockName, Block | ResourceBlock> = {
  empty: {
    id: 0,
    name: 'empty',
    visible: false,
    material: undefined,
    withRigidBody: false,
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
    withRigidBody: true,
    texturePoints: {
      right: getTexturePoints('grass_side'),
      left: getTexturePoints('grass_side'),
      top: getTexturePoints('grass'),
      bottom: getTexturePoints('dirt'),
      front: getTexturePoints('grass_side'),
      back: getTexturePoints('grass_side'),
    },
  },
  dirt: {
    id: 2,
    name: 'dirt',
    visible: true,
    material: new THREE.MeshLambertMaterial({ map: textures.dirt }),
    withRigidBody: true,
    texturePoints: {
      right: getTexturePoints('dirt'),
      left: getTexturePoints('dirt'),
      top: getTexturePoints('dirt'),
      bottom: getTexturePoints('dirt'),
      front: getTexturePoints('dirt'),
      back: getTexturePoints('dirt'),
    },
  },
  stone: {
    id: 3,
    name: 'stone',
    visible: true,
    material: new THREE.MeshLambertMaterial({ map: textures.stone }),
    resource: 'stone',
    scale: { x: 30, y: 30, z: 30 },
    scarcity: 0.8,
    withRigidBody: true,
    texturePoints: {
      right: getTexturePoints('stone'),
      left: getTexturePoints('stone'),
      top: getTexturePoints('stone'),
      bottom: getTexturePoints('stone'),
      front: getTexturePoints('stone'),
      back: getTexturePoints('stone'),
    },
  },
  coalOre: {
    id: 4,
    name: 'coalOre',
    visible: true,
    material: new THREE.MeshLambertMaterial({ map: textures.coalOre }),
    resource: 'coal',
    scale: { x: 20, y: 20, z: 20 },
    scarcity: 0.8,
    withRigidBody: true,
    texturePoints: {
      right: getTexturePoints('coal_ore'),
      left: getTexturePoints('coal_ore'),
      top: getTexturePoints('coal_ore'),
      bottom: getTexturePoints('coal_ore'),
      front: getTexturePoints('coal_ore'),
      back: getTexturePoints('coal_ore'),
    },
  },
  ironOre: {
    id: 5,
    name: 'ironOre',
    visible: true,
    material: new THREE.MeshLambertMaterial({ map: textures.ironOre }),
    resource: 'iron',
    scale: { x: 40, y: 40, z: 40 },
    scarcity: 0.9,
    withRigidBody: true,
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
    withRigidBody: true,
    texturePoints: {
      right: getTexturePoints('tree_side'),
      left: getTexturePoints('tree_side'),
      top: getTexturePoints('tree_top'),
      bottom: getTexturePoints('tree_top'),
      front: getTexturePoints('tree_side'),
      back: getTexturePoints('tree_side'),
    },
  },
  leaves: {
    id: 7,
    name: 'leaves',
    visible: true,
    material: new THREE.MeshLambertMaterial({ map: textures.leaves }),
    withRigidBody: false,
    texturePoints: {
      right: getTexturePoints('leaves'),
      left: getTexturePoints('leaves'),
      top: getTexturePoints('leaves'),
      bottom: getTexturePoints('leaves'),
      front: getTexturePoints('leaves'),
      back: getTexturePoints('leaves'),
    },
  },
  sand: {
    id: 8,
    name: 'sand',
    visible: true,
    material: new THREE.MeshLambertMaterial({ map: textures.sand }),
    withRigidBody: true,
    texturePoints: {
      right: getTexturePoints('sand'),
      left: getTexturePoints('sand'),
      top: getTexturePoints('sand'),
      bottom: getTexturePoints('sand'),
      front: getTexturePoints('sand'),
      back: getTexturePoints('sand'),
    },
  },
  cloud: {
    id: 9,
    name: 'cloud',
    visible: true,
    material: new THREE.MeshLambertMaterial({
      color: 0xf0f0f0,
    }),
    withRigidBody: false,
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
    withRigidBody: true,
    texturePoints: {
      right: getTexturePoints('snow_side'),
      left: getTexturePoints('snow_side'),
      top: getTexturePoints('snow'),
      bottom: getTexturePoints('dirt'),
      front: getTexturePoints('snow_side'),
      back: getTexturePoints('snow_side'),
    },
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
    withRigidBody: true,
    texturePoints: {
      right: getTexturePoints('jungle_tree_side'),
      left: getTexturePoints('jungle_tree_side'),
      top: getTexturePoints('jungle_tree_top'),
      bottom: getTexturePoints('jungle_tree_top'),
      front: getTexturePoints('jungle_tree_side'),
      back: getTexturePoints('jungle_tree_side'),
    },
  },
  jungleLeaves: {
    id: 12,
    name: 'jungleLeaves',
    visible: true,
    material: new THREE.MeshLambertMaterial({ map: textures.jungleLeaves }),
    withRigidBody: false,
    texturePoints: {
      right: getTexturePoints('jungle_leaves'),
      left: getTexturePoints('jungle_leaves'),
      top: getTexturePoints('jungle_leaves'),
      bottom: getTexturePoints('jungle_leaves'),
      front: getTexturePoints('jungle_leaves'),
      back: getTexturePoints('jungle_leaves'),
    },
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
    withRigidBody: true,
    texturePoints: {
      right: getTexturePoints('cactus_side'),
      left: getTexturePoints('cactus_side'),
      top: getTexturePoints('cactus_top'),
      bottom: getTexturePoints('cactus_top'),
      front: getTexturePoints('cactus_side'),
      back: getTexturePoints('cactus_side'),
    },
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
    withRigidBody: true,
    texturePoints: {
      right: getTexturePoints('grass_side'),
      left: getTexturePoints('grass_side'),
      top: getTexturePoints('grass'),
      bottom: getTexturePoints('dirt'),
      front: getTexturePoints('grass_side'),
      back: getTexturePoints('grass_side'),
    },
  },
  water: {
    id: 15,
    name: 'water',
    visible: true,
    material: new THREE.MeshLambertMaterial({
      color: 0x9090e0,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    }),
    withRigidBody: false,
  },
};

export const resources: ResourceBlock[] = [
  blockTypes.stone,
  blockTypes.ironOre,
  blockTypes.coalOre,
] as ResourceBlock[];
