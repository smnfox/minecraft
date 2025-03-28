import * as THREE from 'three';
import {memo, useEffect, useMemo, useRef, useState} from 'react';
import {Water} from './Water.tsx';
import {Block} from './Block.tsx';
import {chunkSize, params} from '../worldParams.ts';
import {blockTypes, resources} from '../blockTypes.ts';
import {createNoise2D, createNoise3D} from 'simplex-noise';
import {BiomeName, BlocksData} from '../types';
import alea from 'alea';
import {useGameStore} from '../gameStore.ts';
import { useShallow } from 'zustand/react/shallow';
import {getPlayerBlock, playerBlockExist} from '../blocksStore.ts';

interface ChunkProps {
  chunkX: number;
  chunkY: number;
  chunkZ: number;
}

export const Chunk = ({chunkX, chunkY, chunkZ}: ChunkProps) => {
  const [blocksData, setBlocksData] = useState<Map<number, BlocksData>>(new Map());
  const seed = useGameStore(useShallow((state) => state.seed));
  const rng = useMemo(() => alea(seed), [seed]);
  const simplex2D = useMemo(() => createNoise2D(rng), [rng]);
  const simplex3D = useMemo(() => createNoise3D(rng), [rng]);

  const terrainData = useRef<Array<Array<Array<{
    id: number;
    instanceId: number | null;
  }>>>>([]);

  const initializeTerrain = () => {
    const data = [];
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
      data.push(slice);
    }

    terrainData.current = data;
  };

  const getBlock = (x: number, y: number, z: number) => {
    if (inBounds(x, y, z)) {
      return terrainData.current[x][y][z];
    } else {
      return null;
    }
  };

  const setBlockInstanceId = (x: number, y: number, z: number, instanceId: number | null) => {
    if (inBounds(x, y, z)) {
      terrainData.current[x][y][z].instanceId = instanceId;
    }
  };

  const setBlockId = (x: number, y: number, z: number, id: number) => {
    if (inBounds(x, y, z)) {
      terrainData.current[x][y][z].id = id;
    }
  };

  useEffect(() => {
    generateChunk({x: chunkX, y: chunkY, z: chunkZ});
  }, []);

  const generateChunk = (chunkPosition: THREE.Vector3Like) => {
    initializeTerrain();
    generateTerrain(chunkPosition);
    generateClouds(chunkPosition);
    loadPlayerChanges(chunkPosition);
    generateBlocks();
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

  const generateTerrain = (chunkPosition: THREE.Vector3Like) => {
    for (let x = 0; x < chunkSize.width; x++) {
      for (let z = 0; z < chunkSize.width; z++) {
        const biome = getBiome(x, z, chunkPosition);

        // Compute the noise value at this x-z location
        const value = simplex2D(
          (chunkPosition.x + x) / params.terrain.scale,
          (chunkPosition.z + z) / params.terrain.scale,
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
            setBlockId(x, y, z, blockTypes.sand.id);
          } else if (y === height) {
            let groundBlockType;
            if (biome === 'Desert') {
              groundBlockType = blockTypes.sand.id;
            } else if (biome === 'Tundra') {
              groundBlockType = blockTypes.snow.id;
            } else if (biome === 'Jungle') {
              groundBlockType = blockTypes.jungleGrass.id;
            } else {
              groundBlockType = blockTypes.grass.id;
            }

            setBlockId(x, y, z, groundBlockType);

            // Randomly generate a tree
            if (rng() < params.trees.frequency) {
              generateTree(biome, x, height + 1, z);
            }
          } else if (y < height && getBlock(x, y, z)?.id === blockTypes.empty.id) {
            generateResourceIfNeeded(x, y, z, chunkPosition);
          }
        }
      }
    }
  };

  const generateResourceIfNeeded = (x: number, y: number, z: number, chunkPosition: THREE.Vector3Like) => {
    setBlockId(x, y, z, blockTypes.dirt.id);
    resources.forEach(resource => {
      const value = simplex3D(
        (chunkPosition.x + x) / resource.scale.x,
        (chunkPosition.y + y) / resource.scale.y,
        (chunkPosition.z + z) / resource.scale.z);

      if (value > resource.scarcity) {
        setBlockId(x, y, z, resource.id);
      }
    });
  };

  const generateTree = (biome: BiomeName, x: number, y: number, z: number) => {
    const minH = params.trees.trunk.minHeight;
    const maxH = params.trees.trunk.maxHeight;
    const h = Math.round(minH + (maxH - minH) * rng());

    for (let treeY = y; treeY < y + h; treeY++) {
      if (biome === 'Temperate' || biome === 'Tundra') {
        setBlockId(x, treeY, z, blockTypes.tree.id);
      } else if (biome === 'Jungle') {
        setBlockId(x, treeY, z, blockTypes.jungleTree.id);
      } else if (biome === 'Desert') {
        setBlockId(x, treeY, z, blockTypes.cactus.id);
      }
    }

    // Generate canopy centered on the top of the tree
    if (biome === 'Temperate' || biome === 'Jungle') {
      generateTreeCanopy(biome, x, y + h, z);
    }
  };

  const generateTreeCanopy = (biome: BiomeName, centerX: number, centerY: number, centerZ: number) => {
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
          const block = getBlock(centerX + x, centerY + y, centerZ + z);
          if (block && block.id !== blockTypes.empty.id) continue;
          // Fill in the tree canopy with leaves based on the density parameter
          if (n < params.trees.canopy.density) {
            if (biome === 'Temperate') {
              setBlockId(centerX + x, centerY + y, centerZ + z, blockTypes.leaves.id);
            } else if (biome === 'Jungle') {
              setBlockId(centerX + x, centerY + y, centerZ + z, blockTypes.jungleLeaves.id);
            }
          }
        }
      }
    }
  };

  const generateClouds = (chunkPosition: THREE.Vector3Like) => {
    for (let x = 0; x < chunkSize.width; x++) {
      for (let z = 0; z < chunkSize.width; z++) {
        const value = (simplex2D(
          (chunkPosition.x + x) / params.clouds.scale,
          (chunkPosition.z + z) / params.clouds.scale,
        ) + 1) * 0.5;

        if (value < params.clouds.density) {
          setBlockId(x, chunkSize.height - 1, z, blockTypes.cloud.id);
        }
      }
    }
  };

  const loadPlayerChanges = (chunkPosition: THREE.Vector3Like)=> {
    for (let x = 0; x < chunkSize.width; x++) {
      for (let y = 0; y < chunkSize.height; y++) {
        for (let z = 0; z < chunkSize.width; z++) {
          if (playerBlockExist(chunkPosition.x, chunkPosition.z, x, y, z)) {
            const blockId = getPlayerBlock(chunkPosition.x, chunkPosition.z, x, y, z);
            if (!blockId) {
              console.error('Cant find any block at: ', x, y, z);
              continue;
            }
            setBlockId(x, y, z, blockId);
          }
        }
      }
    }
  };

  const generateBlocks = () => {
    const tempBlocksData = new Map();

    Object.values(blockTypes)
      .filter((blockType) => blockType.id !== blockTypes.empty.id)
      .forEach((blockType) => {
        tempBlocksData.set(blockType.id, {
          name: blockType.name,
          count: 0,
          instances: [],
        });
      });

    for (let x = 0; x < chunkSize.width; x++) {
      for (let y = 0; y < chunkSize.height; y++) {
        for (let z = 0; z < chunkSize.width; z++) {
          const blockId = getBlock(x, y, z)?.id;

          if (blockId === blockTypes.empty.id) continue;

          const block = tempBlocksData.get(blockId);
          if (!block) {
            console.error('unknown block id: ', blockId);
            continue;
          }
          const instanceId = block.count;

          if (!isBlockObscured(x, y, z)) {
            block.instances.push({
              key: instanceId,
              position: [x, y, z],
            });
            setBlockInstanceId(x, y, z, instanceId);
            block.count++;
          }
        }
      }
    }

    setBlocksData(tempBlocksData);
  };

  const inBounds = (x: number, y: number, z: number) => {
    return x >= 0 && x < chunkSize.width &&
      y >= 0 && y < chunkSize.height &&
      z >= 0 && z < chunkSize.width;
  };

  const isBlockObscured = (x: number, y: number, z: number) => {
    // todo have to get blocks from world, not only from this chunk
    // and then check that its not corner block
    const up = getBlock(x, y + 1, z)?.id ?? blockTypes.empty.id;
    const down = getBlock(x, y - 1, z)?.id ?? blockTypes.empty.id;
    const left = getBlock(x + 1, y, z)?.id ?? blockTypes.empty.id;
    const right = getBlock(x - 1, y, z)?.id ?? blockTypes.empty.id;
    const forward = getBlock(x, y, z + 1)?.id ?? blockTypes.empty.id;
    const back = getBlock(x, y, z - 1)?.id ?? blockTypes.empty.id;

    // If any of the block's sides is exposed, it is not obscured
    return !(up === blockTypes.empty.id ||
      (down === blockTypes.empty.id && y !== 0) ||
      left === blockTypes.empty.id ||
      right === blockTypes.empty.id ||
      forward === blockTypes.empty.id ||
      back === blockTypes.empty.id);
  };

  // const deleteBlockInstance = (x: number, y: number, z: number) => {
  //   const block = getBlock(x, y, z);
  //   if (!block || block.id === blockTypes.empty.id || block.instanceId === null) return;
  //
  //   // Get the mesh and instance id of the block
  //   const blockData = blocksData.get(block.id);
  //   if (!blockData) {
  //     console.error('Cant find block data: ', block.id);
  //     return;
  //   }
  //   const instanceId = block.instanceId;
  //   const instanceIndex = blockData.instances.findIndex((instance) => instance.key === instanceId);
  //   if (instanceIndex > -1) {
  //     blockData.instances.splice(instanceIndex, 1);
  //   }
  //
  //   // This effectively removes the last instance from the scene
  //   blockData.count--;
  //
  //   // todo need to do this in Block.tsx when something changes?
  //   // Notify the instanced mesh we updated the instance matrix
  //   // Also re-compute the bounding sphere so raycasting works
  //   // mesh.instanceMatrix.needsUpdate = true;
  //   // mesh.computeBoundingSphere();
  //
  //   // Remove the instance associated with the block and update the data model
  //   setBlockInstanceId(x, y, z, null);
  // }
  //
  // const addBlockInstance = (x: number, y: number, z: number) => {
  //   const block = getBlock(x, y, z);
  //
  //   // Verify the block exists, it isn't an empty block type, and it doesn't already have an instance
  //   if (block && block.id !== blockTypes.empty.id && block.instanceId === null) {
  //     const blockData = blocksData.get(block.id);
  //     if (!blockData) {
  //       console.log('Cant find block data: ', block.id);
  //       return;
  //     }
  //     const instanceId = blockData.count++;
  //     blockData.instances.push({
  //       key: instanceId,
  //       position: [x, y, z],
  //     });
  //     setBlockInstanceId(x, y, z, instanceId);
  //   }
  // }

  // const addBlock = (x: number, y: number, z: number, blockId: number, chunkPosition: THREE.Vector3Like)=> {
  //   const block = getBlock(x, y, z);
  //   if (block && block.id === blockTypes.empty.id) {
  //     setBlockId(x, y, z, blockId);
  //     addBlockInstance(x, y, z);
  //     setPlayerBlock(chunkPosition.x, chunkPosition.z, x, y, z, blockId);
  //   }
  // }
  //
  // const removeBlock = (x: number, y: number, z: number, chunkPosition: THREE.Vector3Like) => {
  //   const block = getBlock(x, y, z);
  //   if (block && block.id !== blockTypes.empty.id) {
  //     deleteBlockInstance(x, y, z);
  //     setBlockId(x, y, z, blockTypes.empty.id);
  //     setPlayerBlock(chunkPosition.x, chunkPosition.z, x, y, z, blockTypes.empty.id);
  //   }
  // }

  return (
    <group position={[chunkX, chunkY, chunkZ]}>
      <Water />
      {Array.from(blocksData).map(([index, blockType]) =>
        <Block
          blockName={blockType.name}
          key={index}
          count={blockType.count}
          instances={blockType.instances}
        />,
      )}
    </group>
  );
};

export const MemoChunk = memo(Chunk);
