import {CelesteMap} from '../mapTypes/celesteMap.js';
import {Tile} from '../mapTypes/tileMatrix.js';
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

  async getImage(id: number) {
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

  static async #get(id: number, imageName: string) {
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

  static async get(tile: Tile) {
    return this.#get(tile.id, this.nameFromId(tile.id));
  }

  static nameFromId(id: number) {
    switch (String.fromCodePoint(id)) {
      case '1':
        return 'dirt';
      case '3':
        return 'snow';
      case '4':
        return 'girder';
      case '5':
        return 'tower';
      case '6':
        return 'stone';
      case '7':
        return 'cement';
      case '8':
        return 'rock';
      case '9':
        return 'wood';
      case 'a':
        return 'woodStoneEdges';
      case 'b':
        return 'cliffside';
      case 'c':
        return 'poolEdges';
      case 'd':
        return 'templeA';
      case 'e':
        return 'templeB';
      case 'f':
        return 'cliffsideAlt';
      case 'g':
        return 'reflection';
      case 'G':
        return 'reflectionAlt';
      case 'h':
        return 'grass';
      case 'i':
        return 'summit';
      case 'j':
        return 'summitNoSnow';
      case 'k':
        return 'core';
      case 'l':
        return 'deadgrass';
      case 'm':
        return 'lostlevels';
      case 'n':
        return 'scifi';
      case 'z':
        return 'template';
      default:
        console.warn(
          `missing tile id: {${String.fromCodePoint(id)}} charCode: {${id}}`,
        );
        return 'missing';
    }
  }

  static #getPath(path: string) {
    console.log(window.location + `assets/tilesets/${path}.png`);
    return window.location + `assets/tilesets/${path}.png`;
  }
}
