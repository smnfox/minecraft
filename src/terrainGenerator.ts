import {useGameStore} from './gameStore.ts';
import alea from 'alea';
import {createNoise2D, createNoise3D} from 'simplex-noise';
import {chunkSize, params} from './worldParams.ts';
import {blockTypes, resources} from './blockTypes.ts';
import * as THREE from 'three';
import {BiomeName, BlockData, BlockName, ChunkData} from './types';
import {getPlayerBlock, playerBlockExist} from './blocksStore.ts';
import {inChunkBounds} from './helpers.ts';

const seed = useGameStore.getState().seed;
const rng = alea(seed);
const simplex2D = createNoise2D(rng);
const simplex3D = createNoise3D(rng);

const emptyTerrain: Array<Array<Array<{
  id: number;
  instanceId: number | null;
}>>> = [];
for (let x = 0; x < chunkSize.width; x++) {
  const slice = [];
  for (let y = 0; y < chunkSize.height; y++) {
    const row = [];
    for (let z = 0; z < chunkSize.width; z++) {
      row.push({
        id: blockTypes.empty.id,
        instanceId: null,
      });
    }
    slice.push(row);
  }
  emptyTerrain.push(slice);
}

export const generateChunk = (chunkPosition: THREE.Vector3Like): ChunkData => {
  const chunkData = {
    pos: chunkPosition,
    terrainData: structuredClone(emptyTerrain),
    countBlocks: 0,
    solidBlocks: [],
    clouds: [],
    water: [],
  };

  generateTerrain(chunkData);
  generateClouds(chunkData);
  loadPlayerChanges(chunkData);

  return chunkData;
};

const getBiome = (x: number, z: number, chunkPosition: THREE.Vector3Like): BiomeName => {
  let noise = 0.5 * simplex2D(
    (chunkPosition.x + x) / params.biomes.scale,
    (chunkPosition.z + z) / params.biomes.scale,
  ) + 0.5;

  noise += params.biomes.variation.amplitude * (simplex2D(
    (chunkPosition.x + x) / params.biomes.variation.scale,
    (chunkPosition.z + z) / params.biomes.variation.scale,
  ));

  if (noise < params.biomes.tundraToTemperate) {
    return 'Tundra';
  } else if (noise < params.biomes.temperateToJungle) {
    return 'Temperate';
  } else if (noise < params.biomes.jungleToDesert) {
    return 'Jungle';
  } else {
    return 'Desert';
  }
};

const generateTerrain = (chunkData: ChunkData) => {
  for (let x = 0; x < chunkSize.width; x++) {
    for (let z = 0; z < chunkSize.width; z++) {
      const biome = getBiome(x, z, chunkData.pos);

      // Compute the noise value at this x-z location
      const value = simplex2D(
        (chunkData.pos.x + x) / params.terrain.scale,
        (chunkData.pos.z + z) / params.terrain.scale,
      );

      // Scale the noise based on the magnitude/offset
      const scaledNoise = params.terrain.offset + params.terrain.magnitude * value;

      // Computing the height of the terrain at this x-z location
      let height = Math.floor(scaledNoise);

      // Clamping height between 0 and max height
      height = Math.max(0, Math.min(height, chunkSize.height - 1));

      // Fill in all blocks at or below the terrain height
      for (let y = chunkSize.height; y >= 0; y--) {
        if (y <= params.terrain.waterOffset && y === height) {
          setBlockId(x, y, z, blockTypes.sand.name, chunkData);
        } else if (y === height) {
          let groundBlockType: BlockName;
          if (biome === 'Desert') {
            groundBlockType = blockTypes.sand.name;
          } else if (biome === 'Tundra') {
            groundBlockType = blockTypes.snow.name;
          } else if (biome === 'Jungle') {
            groundBlockType = blockTypes.jungleGrass.name;
          } else {
            groundBlockType = blockTypes.grass.name;
          }

          setBlockId(x, y, z, groundBlockType, chunkData);

          // Randomly generate a tree
          if (rng() < params.trees.frequency) {
            generateTree(biome, x, height + 1, z, chunkData);
          }
        } else if (y < height && getBlock(x, y, z, chunkData)?.id === blockTypes.empty.id) {
          //generateResourceIfNeeded(x, y, z, chunkData);
        }
      }
    }
  }
};

const generateResourceIfNeeded = (x: number, y: number, z: number, chunkData: ChunkData) => {
  // check that block is not obscured and its stone on sides
  setBlockId(x, y, z, blockTypes.dirt.name, chunkData);
  resources.forEach(resource => {
    const value = simplex3D(
      (chunkData.pos.x + x) / resource.scale.x,
      (chunkData.pos.y + y) / resource.scale.y,
      (chunkData.pos.z + z) / resource.scale.z);

    if (value > resource.scarcity) {
      setBlockId(x, y, z, resource.name, chunkData);
    }
  });
};

const generateTree = (biome: BiomeName, x: number, y: number, z: number, chunkData: ChunkData) => {
  // todo generate based on all chunks, not only this chunk
  const minH = params.trees.trunk.minHeight;
  const maxH = params.trees.trunk.maxHeight;
  const h = Math.round(minH + (maxH - minH) * rng());

  for (let treeY = y; treeY < y + h; treeY++) {
    if (biome === 'Temperate' || biome === 'Tundra') {
      setBlockId(x, treeY, z, blockTypes.tree.name, chunkData);
    } else if (biome === 'Jungle') {
      setBlockId(x, treeY, z, blockTypes.jungleTree.name, chunkData);
    } else if (biome === 'Desert') {
      setBlockId(x, treeY, z, blockTypes.cactus.name, chunkData);
    }
  }

  // Generate canopy centered on the top of the tree
  if (biome === 'Temperate' || biome === 'Jungle') {
    generateTreeCanopy(biome, x, y + h, z, chunkData);
  }
};

const generateTreeCanopy = (biome: BiomeName, centerX: number, centerY: number, centerZ: number, chunkData: ChunkData) => {
  const minR = params.trees.canopy.minRadius;
  const maxR = params.trees.canopy.maxRadius;
  const r = Math.round(minR + (maxR - minR) * rng());

  for (let x = -r; x <= r; x++) {
    for (let y = -r; y <= r; y++) {
      for (let z = -r; z <= r; z++) {
        const n = rng();

        // Make sure the block is within the canopy radius
        if (x * x + y * y + z * z > r * r) continue;
        // Don't overwrite an existing block
        const block = getBlock(centerX + x, centerY + y, centerZ + z, chunkData);
        if (block && block.id !== blockTypes.empty.id) continue;
        // Fill in the tree canopy with leaves based on the density parameter
        if (n < params.trees.canopy.density) {
          if (biome === 'Temperate') {
            setBlockId(centerX + x, centerY + y, centerZ + z, blockTypes.leaves.name, chunkData);
          } else if (biome === 'Jungle') {
            setBlockId(centerX + x, centerY + y, centerZ + z, blockTypes.jungleLeaves.name, chunkData);
          }
        }
      }
    }
  }
};

const generateClouds = (chunkData: ChunkData) => {
  for (let x = 0; x < chunkSize.width; x++) {
    for (let z = 0; z < chunkSize.width; z++) {
      const value = (simplex2D(
        (chunkData.pos.x + x) / params.clouds.scale,
        (chunkData.pos.z + z) / params.clouds.scale,
      ) + 1) * 0.5;

      if (value < params.clouds.density) {
        setBlockId(x, chunkSize.height - 1, z, blockTypes.cloud.name, chunkData);
      }
    }
  }
};

const loadPlayerChanges = (chunkData: ChunkData)=> {
  //todo optimize this
  for (let x = 0; x < chunkSize.width; x++) {
    for (let y = 0; y < chunkSize.height; y++) {
      for (let z = 0; z < chunkSize.width; z++) {
        if (playerBlockExist(chunkData.pos.x, chunkData.pos.z, x, y, z)) {
          const blockId = getPlayerBlock(chunkData.pos.x, chunkData.pos.z, x, y, z);
          const block = Object.values(blockTypes).find((block) => block.id === blockId);
          if (!blockId || !block) {
            console.error('Cant find any block at: ', x, y, z);
            continue;
          }
          setBlockId(x, y, z, block.name, chunkData);
        }
      }
    }
  }
};

export const getBlock = (x: number, y: number, z: number, chunkData: ChunkData) => {
  if (chunkData.terrainData && inChunkBounds(x, y, z)) {
    return chunkData.terrainData[x][y][z];
  }
  return null;
};

const setBlockId = (x: number, y: number, z: number, name: BlockName, chunkData: ChunkData) => {
  if (!chunkData.terrainData || !inChunkBounds(x, y, z)) {
    return;
  }

  const block = blockTypes[name];
  chunkData.terrainData[x][y][z].id = block.id;

  chunkData.countBlocks++;
  const blockData: BlockData = {
    key: `${chunkData.pos.x}${chunkData.pos.z}${chunkData.countBlocks}`,
    position: [x, y, z],
    name: block.name,
    sides: {
      hasBelow: false,
      hasAbove: false,
      hasFront: false,
      hasBehind: false,
      hasLeft: false,
      hasRight: false,
    },
  };
  if (block.name === blockTypes.cloud.name) {
    chunkData.clouds.push(blockData);
  } else if (block.name === blockTypes.water.name) {
    chunkData.water.push(blockData);
  } else {
    chunkData.solidBlocks.push(blockData);
  }
};
