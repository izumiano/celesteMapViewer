export class TileMatrix {
  #matrix: Tile[] = [];
  #width = 0;
  #height = 0;

  get width() {
    return this.#width;
  }

  get height() {
    return this.#height;
  }

  constructor(tiles: string) {
    tiles ??= '';

    tiles = tiles.replaceAll('\r\n', '\n');
    const tileArr = tiles.split('\n');

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

    this.#autoTile();
  }

  #autoTile() {
    for (let y = 0; y < this.#height; y++) {
      for (let x = 0; x < this.#width; x++) {
        const currentTile = this.get(x, y);

        if (currentTile?.isSolid()) {
          currentTile.adjacents = this.#getAdjacents(x, y);
        }
      }
    }
  }

  #getAdjacents(x: number, y: number) {
    const adjacents = new Adjacents();

    for (let y2 = -1; y2 < 2; y2++) {
      const checkY = y + y2;
      for (let x2 = -1; x2 < 2; x2++) {
        const checkX = x + x2;
        const tile = this.get(checkX, checkY);

        adjacents.set(x2, y2, tile ?? new Tile('o'.charCodeAt(0)));
      }
    }

    return adjacents;
  }

  get(x: number, y: number) {
    if (x < 0 || x > this.#width || y < 0 || y > this.#height) {
      return null;
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
}

export class Adjacents {
  #matrix: Tile[];

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

  equals(adjacents: Adjacents) {
    for (let i = 0; i < this.#matrix.length; i++) {
      if (adjacents.#matrix[i] !== this.#matrix[i]) {
        return false;
      }
    }
    return true;
  }
}
