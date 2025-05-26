import {CelesteMap} from '../mapTypes/celesteMap.js';
import {Vector2} from '../utils/vector2.js';

export class Tileset {
  static tilesets: Map<number, Tileset> = new Map();

  image: HTMLImageElement;
  #imageTileSize: Vector2;
  tiles: Map<number, ImageBitmap> = new Map();

  constructor(image: HTMLImageElement) {
    this.image = image;
    this.#imageTileSize = new Vector2(
      Math.floor(image.width / CelesteMap.tileMultiplier),
      Math.floor(image.height / CelesteMap.tileMultiplier),
    );
  }

  async get(id: number) {
    if (this.tiles.has(id)) {
      return this.tiles.get(id)!;
    }

    let y = Math.floor(id / 6);
    let x = id - y * 6; // x = id % 6

    if (x >= this.#imageTileSize.x || y >= this.#imageTileSize.y) {
      x = 0;
      y = 0;
    }

    // console.log({id: id, x: x, y: y});

    const image = await window.createImageBitmap(
      this.image,
      x * CelesteMap.tileMultiplier,
      y * CelesteMap.tileMultiplier,
      CelesteMap.tileMultiplier,
      CelesteMap.tileMultiplier,
    );
    this.tiles.set(id, image);
    return image;
  }

  static async get(id: number, imageName: string) {
    if (this.tilesets.has(id)) {
      return this.tilesets.get(id)!;
    }

    const image = new Image();

    await new Promise((resolve, reject) => {
      image.onload = () => {
        resolve(null);
      };
      image.onerror = () => {
        reject('Failed loading image');
      };
      image.src = this.#getPath(imageName);
    });
    const tileset = new Tileset(image);

    this.tilesets.set(id, tileset);
    return tileset;
  }

  static async getFromId(id: number) {
    return this.get(id, this.nameFromId(id));
  }

  static nameFromId(id: number) {
    switch (id) {
      case 1:
        return 'dirt';
      case 3:
        return 'snow';
      case 4:
        return 'girder';
      case 5:
        return 'tower';
      case 6:
        return 'stone';
      case 7:
        return 'cement';
      case 8:
        return 'rock';
      case 9:
        return 'wood';
      case 10:
        return 'woodStoneEdges';
      case 11:
        return 'cliffside';
      case 12:
        return 'poolEdges';
      case 13:
        return 'templeA';
      case 14:
        return 'templeB';
      case 15:
        return 'cliffsideAlt';
      case 16:
        return 'reflection';
      case 17:
        return 'grass';
      case 18:
        return 'summit';
      case 19:
        return 'summitNoSnow';
      case 20:
        return 'core';
      case 21:
        return 'deadgrass';
      case 22:
        return 'lostLevels';
      case 23:
        return 'scifi';
      case 35:
        return 'template';
      case 129:
        return 'reflectionAlt';
      default:
        console.warn(`missing tile id ${id}`);
        return 'missing';
    }
  }

  static #getPath(path: string) {
    console.log(window.location + `assets/tilesets/${path}.png`);
    return window.location + `assets/tilesets/${path}.png`;
  }
}
