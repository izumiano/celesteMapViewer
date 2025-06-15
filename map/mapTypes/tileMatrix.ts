import {Vector2} from '../utils/vector2.js';
import {CelesteMap} from './celesteMap.js';
import {Level} from './level.js';

export class TileMatrix implements Iterable<Tile> {
  #matrix: Tile[] = [];
  #width = 0;
  #height = 0;

  #actualWidth = 0;
  #actualHeight = 0;

  get width() {
    return this.#width;
  }

  get height() {
    return this.#height;
  }

  constructor(
    matrix: Tile[],
    matrixWidth: number,
    matrixHeight: number,
    actualWidth: number,
    actualHeight: number,
  ) {
    this.#matrix = matrix;
    this.#width = matrixWidth;
    this.#height = matrixHeight;
    this.#actualWidth = actualWidth;
    this.#actualHeight = actualHeight;
  }

  static createFromString(tiles: string, level: Level) {
    tiles ??= '';

    tiles = tiles.replaceAll('\r\n', '\n');
    const tileArr = tiles.split('\n');

    const actualWidth = level.width / CelesteMap.tileMultiplier;
    const actualHeight = level.height / CelesteMap.tileMultiplier;

    const height = tileArr.length;

    let width = 0;
    for (const line of tileArr) {
      width = Math.max(width, line.length);
    }

    const matrix = [];
    for (let line of tileArr) {
      const extraLength = width - line.length;
      line += '0'.repeat(extraLength);

      for (const char of line) {
        matrix.push(new Tile(char.charCodeAt(0)));
      }
    }

    return new TileMatrix(matrix, width, height, actualWidth, actualHeight);
  }

  autoTile(map: CelesteMap | null = null, level: Level | null = null) {
    for (let y = 0; y < this.#height; y++) {
      for (let x = 0; x < this.#width; x++) {
        const currentTile = this.get(x, y);

        if (currentTile?.isSolid()) {
          currentTile.adjacents = this.#getAdjacents(x, y, map, level);
        }
      }
    }
  }

  #getAdjacents(
    x: number,
    y: number,
    map: CelesteMap | null = null,
    level: Level | null = null,
  ) {
    const adjacents = new Adjacents();

    const levelX =
      map && level
        ? (level.x - map.bounds.left) / CelesteMap.tileMultiplier
        : 0;
    const levelY =
      map && level ? (level.y - map.bounds.top) / CelesteMap.tileMultiplier : 0;

    let isSurrounded = true;
    for (let y2 = -1; y2 < 2; y2++) {
      const checkY = y + y2;
      for (let x2 = -1; x2 < 2; x2++) {
        const checkX = x + x2;
        let tile = this.get(checkX, checkY);
        tile ??= map
          ? map.getTileAt(new Vector2(levelX + checkX, levelY + checkY))
          : null;

        tile ??= map ? new Tile('o'.charCodeAt(0)) : Tile.air();
        if (!tile.isSolid()) {
          isSurrounded = false;
        }
        adjacents.set(x2, y2, tile);
      }
    }

    if (isSurrounded) {
      const outer = [];
      if (map) {
        outer.push(
          map.getTileAt(new Vector2(levelX + x - 2, levelY + y)),
          map.getTileAt(new Vector2(levelX + x + 2, levelY + y)),
          map.getTileAt(new Vector2(levelX + x, levelY + y - 2)),
          map.getTileAt(new Vector2(levelX + x, levelY + y + 2)),
        );
      } else {
        outer.push(
          this.get(levelX + x - 2, levelY + y),
          this.get(levelX + x + 2, levelY + y),
          this.get(levelX + x, levelY + y - 2),
          this.get(levelX + x, levelY + y + 2),
        );
      }

      adjacents.outer = outer;
    }

    return adjacents;
  }

  get(x: number, y: number) {
    if (x < 0 || x >= this.#actualWidth || y < 0 || y >= this.#actualHeight) {
      return null;
    }

    if (x >= this.#width || y >= this.#height) {
      return Tile.air();
    }

    return this.#matrix[x + y * this.#width];
  }

  toArr() {
    const ret: Tile[][] = [];
    for (let y = 0; y < this.height; y++) {
      const arr: Tile[] = [];
      for (let x = 0; x < this.width; x++) {
        const tile = this.get(x, y);
        if (tile) {
          arr.push();
        }
      }
      ret.push(arr);
    }
    return ret;
  }

  [Symbol.iterator](): Iterator<Tile> {
    let index = 0;
    const matrix = this.#matrix;

    return {
      next: (): IteratorResult<Tile> => {
        if (index < matrix.length) {
          return {value: matrix[index++], done: false};
        } else {
          return {value: undefined, done: true};
        }
      },
    };
  }
}

export class Tile {
  id: number;
  adjacents: Adjacents | null = null;

  get idChar() {
    return String.fromCodePoint(this.id);
  }

  constructor(id: number) {
    this.id = id;
  }

  isSolid() {
    // 48 is unicode for "0"
    return this.id !== 48;
  }

  static air() {
    return new Tile(48);
  }
}

export class Adjacents {
  #matrix: Tile[];

  outer: (Tile | null)[] = [];

  constructor(matrix: Tile[] = new Array(9)) {
    if (matrix.length !== 9) {
      throw new Error('matrix length needs to be 9');
    }

    this.#matrix = matrix;
  }

  get(x: number, y: number) {
    const index = x + 1 + (y + 1) * 3;

    return this.#matrix[index];
  }

  set(x: number, y: number, id: Tile) {
    const index = x + 1 + (y + 1) * 3;

    this.#matrix[index] = id;
  }

  getAtIndex(i: number) {
    return this.#matrix[i];
  }

  isCenter(ignoreStr: string | null, tile: Tile) {
    if (this.outer.length <= 0) {
      return false;
    }

    for (let adjacentTile of this.outer) {
      if (!adjacentTile) {
        return false;
      }
      const ignores = this.isIgnoreSolid(ignoreStr, adjacentTile, tile);
      if (adjacentTile.isSolid() && !ignores) {
        continue;
      }
      return false;
    }
    return true;
  }

  isIgnoreSolid(ignoreStr: string | null, adjacentTile: Tile, tile: Tile) {
    if (tile.idChar === adjacentTile.idChar) {
      return false;
    }
    return (
      ignoreStr === '*' || (ignoreStr?.includes(adjacentTile?.idChar) ?? false)
    );
  }

  equals(adjacents: Adjacents) {
    for (let i = 0; i < this.#matrix.length; i++) {
      if (adjacents.#matrix[i] !== this.#matrix[i]) {
        return false;
      }
    }
    return true;
  }

  log() {
    let message = '';
    for (let y = -1; y < 2; y++) {
      let line = '';
      for (let x = -1; x < 2; x++) {
        const adjacent = this.get(x, y);

        line += adjacent.idChar;
      }
      message += line + '\n';
    }
    console.log(message);
  }
}
