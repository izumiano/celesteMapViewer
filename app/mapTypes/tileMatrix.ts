export class TileMatrix {
  #matrix: number[] = [];
  #width = 0;
  #height = 0;

  get width() {
    return this.#width;
  }

  get height() {
    return this.#height;
  }

  constructor(tiles: string) {
    tiles = tiles.replace('\r\n', '\n');
    const tileArr = tiles.split('\n');

    this.#height = tileArr.length;

    for (const line of tileArr) {
      this.#width = Math.max(this.#width, line.length);
    }

    for (let line of tileArr) {
      const extraLength = this.#width - line.length;
      line += '0'.repeat(extraLength);

      for (const char of line) {
        this.#matrix.push(Number(char));
      }
    }
  }

  get(x: number, y: number) {
    return this.#matrix[x + y * this.#width];
  }

  toStr() {
    let str = '';
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        str += this.get(x, y);
      }
      str += '\n';
    }
    return str;
  }
}
