import {getRandomInt} from '../../utils/math.js';
import {CelesteMap} from '../mapTypes/celesteMap.js';
import {Adjacents, Tile} from '../mapTypes/tileMatrix.js';
import {Vector2} from '../utils/vector2.js';

export class Tileset {
  static tilesets: Map<number, Tileset> = new Map();

  image: HTMLImageElement;
  tilesetInfo: TilesetInfo | null;
  tiles: Map<number, ImageBitmap> = new Map();

  constructor(image: HTMLImageElement, tilesetInfo: TilesetInfo | null) {
    this.image = image;
    this.tilesetInfo = tilesetInfo;
  }

  static async create(tile: Tile) {
    const image = new Image();

    const tilesetInfo = TilesetInfo.lazyGet(tile.idChar);

    await new Promise((resolve, reject) => {
      image.onload = () => {
        resolve(null);
      };
      image.onerror = () => {
        reject('Failed loading image');
      };
      image.src = this.#getImagePath(tilesetInfo?.path);
    });

    return new Tileset(image, tilesetInfo);
  }

  async getImage(tile: Tile) {
    if (this.tiles.has(tile.id)) {
      return this.tiles.get(tile.id)!;
    }

    let id = 0;

    const tileCoordinate =
      this.tilesetInfo?.getMatch(tile)?.chooseTile() ?? new Vector2(0, 0);

    const image = await window.createImageBitmap(
      this.image,
      tileCoordinate.x * CelesteMap.tileMultiplier,
      tileCoordinate.y * CelesteMap.tileMultiplier,
      CelesteMap.tileMultiplier,
      CelesteMap.tileMultiplier,
    );
    this.tiles.set(id, image);
    return image;
  }

  static async lazyGet(tile: Tile) {
    const id = tile.id;

    if (this.tilesets.has(id)) {
      return this.tilesets.get(id)!;
    }

    const tileset = await Tileset.create(tile);

    this.tilesets.set(id, tileset);
    return tileset;
  }

  static #getImagePath(path: string | undefined) {
    if (!path) {
      console.warn('missing path');
      path = 'missing';
    }

    return window.location + `assets/tilesets/${path}.png`;
  }
}

export class TilesetInfo {
  static tilesetInfos: Map<string, TilesetInfo> = new Map();

  id: string;
  path: string;
  tileInfos: TileInfo[] = [];
  ignores: string | null;

  constructor(tileset: Element, tilesetInfos: Map<string, TilesetInfo>) {
    const id = tileset.getAttribute('id');
    if (!id) {
      throw new Error('tileset did not have an id');
    }
    this.id = id;

    const path = tileset.getAttribute('path');
    if (!path) {
      throw new Error('tileset did not have a path');
    }
    this.path = path;

    this.ignores = tileset.getAttribute('ignores');

    const copy = tileset.getAttribute('copy');
    if (copy) {
      const tileInfo = tilesetInfos.get(copy)?.tileInfos;
      if (!tileInfo) {
        throw new Error(
          `tileset: ${id} tried copying: ${copy} but it was not in tilesetInfos`,
        );
      }
      this.tileInfos = tileInfo;
    } else {
      for (const set of tileset.getElementsByTagName('set')) {
        this.tileInfos.push(new TileInfo(set));
      }
    }
  }

  getMatch(tile: Tile) {
    const adjacents = tile.adjacents;
    if (!adjacents) {
      return null;
    }

    for (const tileInfo of this.tileInfos) {
      if (tileInfo.match(tile, adjacents, this.ignores)) {
        return tileInfo;
      }
    }
    return null;
  }

  static lazyGet(id: string) {
    if (this.tilesetInfos.has(id)) {
      return this.tilesetInfos.get(id)!;
    }
    console.warn(`id: ${id} not in tileset infos`);
    return this.tilesetInfos.get('1')!;
  }

  static async populate(
    path: string = import.meta.resolve('/assets/ForegroundTiles.xml'),
  ) {
    const xmlText = await (await fetch(path)).text();
    const parser = new DOMParser();
    const xml = <XMLDocument>parser.parseFromString(xmlText, 'text/xml');
    const xmlData = xml.getElementsByTagName('Data');
    if (xmlData.length <= 0) {
      return null;
    }
    const xmlTilesets = xmlData[0].getElementsByTagName('Tileset');

    const tilesetInfos: Map<string, TilesetInfo> = new Map();

    for (const tileset of xmlTilesets) {
      tilesetInfos.set(tileset.id, new TilesetInfo(tileset, tilesetInfos));
    }

    this.tilesetInfos = new Map(
      [...this.tilesetInfos].concat([...tilesetInfos]),
    );
  }
}

class TileInfo {
  #mask: string;
  #tiles: Vector2[];

  chooseTile() {
    return this.#tiles[getRandomInt(0, this.#tiles.length - 1)];
  }

  constructor(tileInfo: Element) {
    const mask = tileInfo.getAttribute('mask');
    if (!mask) {
      throw new Error('tileInfo did not have a mask');
    }
    this.#mask = mask.replaceAll('-', '');

    const tiles = tileInfo.getAttribute('tiles');
    if (!tiles) {
      throw new Error('tileInfo did not have a tiles');
    }
    this.#tiles = tiles.split(';').map(strPos => {
      const coordinates = strPos.split(',');
      if (coordinates.length !== 2) {
        throw new Error('More than 2 coordinate values');
      }
      const x = Number(coordinates[0]);
      const y = Number(coordinates[1]);

      return new Vector2(x, y);
    });
  }

  match(tile: Tile, adjacents: Adjacents, ignores: string | null) {
    if (this.#mask === 'padding') {
      if (!this.#match(tile, adjacents, '111111111', ignores)) {
        return false;
      }
      return !adjacents.isCenter(ignores, tile);
    }

    if (this.#mask === 'center') {
      if (!this.#match(tile, adjacents, '111111111', ignores)) {
        return false;
      }
      return adjacents.isCenter(ignores, tile);
    }

    return this.#match(tile, adjacents, this.#mask, ignores);
  }

  #match(
    tile: Tile,
    adjacents: Adjacents,
    mask: string,
    ignores: string | null,
  ) {
    for (let i = 0; i < mask.length; i++) {
      const maskTile = mask[i];
      const adjacentTile = adjacents.getAtIndex(i);
      const isSolid = adjacentTile.isSolid();
      const ignore = adjacents.isIgnoreSolid(ignores, adjacentTile, tile);

      if (
        maskTile === 'x' ||
        (maskTile === '0' && (!isSolid || ignore)) ||
        (maskTile === '1' && isSolid && !ignore)
      ) {
        continue;
      }
      return false;
    }

    return true;
  }
}
