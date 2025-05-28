import {Vector2} from '../utils/vector2.js';
import {CelesteMap} from './celesteMap.js';
import {Level} from './level.js';

export class TileMatrix {
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

  constructor(tiles: string, level: Level) {
    tiles ??= '';

    tiles = tiles.replaceAll('\r\n', '\n');
    const tileArr = tiles.split('\n');

    this.#actualWidth = level.width / CelesteMap.tileMultiplier;
    this.#actualHeight = level.height / CelesteMap.tileMultiplier;

    this.#height = tileArr.length;

    for (const line of tileArr) {
      this.#width = Math.max(this.#width, line.length);
    }

    for (let line of tileArr) {
      const extraLength = this.#width - line.length;
      line += '0'.repeat(extraLength);

      for (const char of line) {
        this.#matrix.push(new Tile(char.charCodeAt(0)));
      }
    }
  }

  autoTile(map: CelesteMap, level: Level) {
    for (let y = 0; y < this.#height; y++) {
      for (let x = 0; x < this.#width; x++) {
        const currentTile = this.get(x, y);

        if (currentTile?.isSolid()) {
          currentTile.adjacents = this.#getAdjacents(x, y, map, level);
        }
      }
    }
  }

  #getAdjacents(x: number, y: number, map: CelesteMap, level: Level) {
    const adjacents = new Adjacents();

    const levelX = (level.x - map.bounds.left) / CelesteMap.tileMultiplier;
    const levelY = (level.y - map.bounds.top) / CelesteMap.tileMultiplier;

    let isSurrounded = true;
    for (let y2 = -1; y2 < 2; y2++) {
      const checkY = y + y2;
      for (let x2 = -1; x2 < 2; x2++) {
        const checkX = x + x2;
        let tile: Tile | null | undefined = this.get(checkX, checkY);
        if (!tile) {
          tile = map.getTileAt(new Vector2(levelX + checkX, levelY + checkY));
        }

        const newTile = tile ?? new Tile('o'.charCodeAt(0));
        if (!newTile.isSolid()) {
          isSurrounded = false;
        }
        adjacents.set(x2, y2, newTile);
      }
    }

    if (isSurrounded) {
      const outer = [];
      outer.push(
        map.getTileAt(new Vector2(levelX + x - 2, levelY + y)),
        map.getTileAt(new Vector2(levelX + x + 2, levelY + y)),
        map.getTileAt(new Vector2(levelX + x, levelY + y - 2)),
        map.getTileAt(new Vector2(levelX + x, levelY + y + 2)),
      );

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
        continue;
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
