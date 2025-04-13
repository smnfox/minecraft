import {Vector2, Vector3} from 'three';
import {BlockData, BlockName} from './types';
import {blockTypes} from './blockTypes.ts';

interface Points {
  vertices: number[];
  uvs: number[];
}

export const generatePoints = (data: BlockData[]) => {
  const points: Points = {
    vertices: [],
    uvs: [],
  };
  data.forEach((block) => {
    const vertices = new Vector3(block.position[0], block.position[1], block.position[2]);
    if (!block.sides?.hasBelow) {
      setBottom(vertices, points, block.name);
    }
    if (!block.sides?.hasAbove) {
      setTop(vertices, points, block.name);
    }
    if (!block.sides?.hasLeft) {
      setLeft(vertices, points, block.name);
    }
    if (!block.sides?.hasRight) {
      setRight(vertices, points, block.name);
    }
    if (!block.sides?.hasFront) {
      setFront(vertices, points, block.name);
    }
    if (!block.sides?.hasBehind) {
      setBack(vertices, points, block.name);
    }
  });

  return points;
};

const addVertices = (vector: Vector3, vertices: number[]) => {
  vertices.push(
    vector.x,
    vector.y,
    vector.z,
  );
};

const addUvs = (vector: Vector2, uvs: number[]) => {
  uvs.push(
    vector.x,
    vector.y,
  );
};

const setBottom = (vertices: Vector3, points: Points, name: BlockName) => {
  const leftBottom = new Vector3(0, 0, 0).add(vertices);
  const rightBottom = new Vector3(1, 0, 0).add(vertices);
  const leftTop = new Vector3(0, 0, 1).add(vertices);
  const rightTop = new Vector3(1, 0, 1).add(vertices);

  addVertices(leftBottom, points.vertices);
  addVertices(rightBottom, points.vertices);
  addVertices(leftTop, points.vertices);
  addVertices(rightBottom, points.vertices);
  addVertices(rightTop, points.vertices);
  addVertices(leftTop, points.vertices);
  
  if (blockTypes[name].texturePoints) {
    addUvs(blockTypes[name].texturePoints.bottom.leftBottom, points.uvs);
    addUvs(blockTypes[name].texturePoints.bottom.rightBottom, points.uvs);
    addUvs(blockTypes[name].texturePoints.bottom.leftTop, points.uvs);
    addUvs(blockTypes[name].texturePoints.bottom.rightBottom, points.uvs);
    addUvs(blockTypes[name].texturePoints.bottom.rightTop, points.uvs);
    addUvs(blockTypes[name].texturePoints.bottom.leftTop, points.uvs);
  }
};

const setTop = (vertices: Vector3, points: Points, name: BlockName)=> {
  const leftBottom = new Vector3(0, 1, 0).add(vertices);
  const rightBottom = new Vector3(1, 1, 0).add(vertices);
  const leftTop = new Vector3(0, 1, 1).add(vertices);
  const rightTop = new Vector3(1, 1, 1).add(vertices);

  addVertices(leftBottom, points.vertices);
  addVertices(leftTop, points.vertices);
  addVertices(rightBottom, points.vertices);
  addVertices(rightBottom, points.vertices);
  addVertices(leftTop, points.vertices);
  addVertices(rightTop, points.vertices);
  
  if (blockTypes[name].texturePoints) {
    addUvs(blockTypes[name].texturePoints.top.leftBottom, points.uvs);
    addUvs(blockTypes[name].texturePoints.top.leftTop, points.uvs);
    addUvs(blockTypes[name].texturePoints.top.rightBottom, points.uvs);
    addUvs(blockTypes[name].texturePoints.top.rightBottom, points.uvs);
    addUvs(blockTypes[name].texturePoints.top.leftTop, points.uvs);
    addUvs(blockTypes[name].texturePoints.top.rightTop, points.uvs);
  }
};

const setLeft = (vertices: Vector3, points: Points, name: BlockName) => {
  const leftBottom = new Vector3(0, 0, 0).add(vertices);
  const rightBottom = new Vector3(0, 0, 1).add(vertices);
  const leftTop = new Vector3(0, 1, 0).add(vertices);
  const rightTop = new Vector3(0, 1, 1).add(vertices);

  addVertices(leftBottom, points.vertices);
  addVertices(rightBottom, points.vertices);
  addVertices(leftTop, points.vertices);
  addVertices(rightBottom, points.vertices);
  addVertices(rightTop, points.vertices);
  addVertices(leftTop, points.vertices);

  if (blockTypes[name].texturePoints) {
    addUvs(blockTypes[name].texturePoints.left.leftBottom, points.uvs);
    addUvs(blockTypes[name].texturePoints.left.rightBottom, points.uvs);
    addUvs(blockTypes[name].texturePoints.left.leftTop, points.uvs);
    addUvs(blockTypes[name].texturePoints.left.rightBottom, points.uvs);
    addUvs(blockTypes[name].texturePoints.left.rightTop, points.uvs);
    addUvs(blockTypes[name].texturePoints.left.leftTop, points.uvs);
  }
};

const setRight = (vertices: Vector3, points: Points, name: BlockName) => {
  const leftBottom = new Vector3(1, 0, 0).add(vertices);
  const rightBottom = new Vector3(1, 0, 1).add(vertices);
  const leftTop = new Vector3(1, 1, 0).add(vertices);
  const rightTop = new Vector3(1, 1, 1).add(vertices);

  addVertices(leftBottom, points.vertices);
  addVertices(leftTop, points.vertices);
  addVertices(rightBottom, points.vertices);
  addVertices(rightBottom, points.vertices);
  addVertices(leftTop, points.vertices);
  addVertices(rightTop, points.vertices);

  if (blockTypes[name].texturePoints) {
    addUvs(blockTypes[name].texturePoints.right.leftBottom, points.uvs);
    addUvs(blockTypes[name].texturePoints.right.leftTop, points.uvs);
    addUvs(blockTypes[name].texturePoints.right.rightBottom, points.uvs);
    addUvs(blockTypes[name].texturePoints.right.rightBottom, points.uvs);
    addUvs(blockTypes[name].texturePoints.right.leftTop, points.uvs);
    addUvs(blockTypes[name].texturePoints.right.rightTop, points.uvs);
  }
};

const setFront = (vertices: Vector3, points: Points, name: BlockName) => {
  const leftBottom = new Vector3(0, 0, 1).add(vertices);
  const rightBottom = new Vector3(1, 0, 1).add(vertices);
  const leftTop = new Vector3(0, 1, 1).add(vertices);
  const rightTop = new Vector3(1, 1, 1).add(vertices);

  addVertices(leftBottom, points.vertices);
  addVertices(rightBottom, points.vertices);
  addVertices(leftTop, points.vertices);
  addVertices(rightBottom, points.vertices);
  addVertices(rightTop, points.vertices);
  addVertices(leftTop, points.vertices);

  if (blockTypes[name].texturePoints) {
    addUvs(blockTypes[name].texturePoints.front.leftBottom, points.uvs);
    addUvs(blockTypes[name].texturePoints.front.rightBottom, points.uvs);
    addUvs(blockTypes[name].texturePoints.front.leftTop, points.uvs);
    addUvs(blockTypes[name].texturePoints.front.rightBottom, points.uvs);
    addUvs(blockTypes[name].texturePoints.front.rightTop, points.uvs);
    addUvs(blockTypes[name].texturePoints.front.leftTop, points.uvs);
  }
};

const setBack = (vertices: Vector3, points: Points, name: BlockName) => {
  const leftBottom = new Vector3(0, 0, 0).add(vertices);
  const rightBottom = new Vector3(1, 0, 0).add(vertices);
  const leftTop = new Vector3(0, 1, 0).add(vertices);
  const rightTop = new Vector3(1, 1, 0).add(vertices);

  addVertices(leftBottom, points.vertices);
  addVertices(leftTop, points.vertices);
  addVertices(rightBottom, points.vertices);
  addVertices(rightBottom, points.vertices);
  addVertices(leftTop, points.vertices);
  addVertices(rightTop, points.vertices);

  if (blockTypes[name].texturePoints) {
    addUvs(blockTypes[name].texturePoints.back.leftBottom, points.uvs);
    addUvs(blockTypes[name].texturePoints.back.leftTop, points.uvs);
    addUvs(blockTypes[name].texturePoints.back.rightBottom, points.uvs);
    addUvs(blockTypes[name].texturePoints.back.rightBottom, points.uvs);
    addUvs(blockTypes[name].texturePoints.back.leftTop, points.uvs);
    addUvs(blockTypes[name].texturePoints.back.rightTop, points.uvs);
  }
};
