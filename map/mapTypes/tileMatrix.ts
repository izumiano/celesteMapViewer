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
    tiles ??= '';

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
        this.#matrix.push(this.#getTileId(char));
      }
    }
  }

  #getTileId(char: string) {
    const num = parseInt(char);
    if (isNaN(num)) {
      const charCode = char.charCodeAt(0);
      if (charCode >= 65 && charCode <= 90) {
        return charCode + 58;
      } else {
        return charCode - 87;
      }
    }
    return num;
  }

  get(x: number, y: number) {
    return this.#matrix[x + y * this.#width];
  }

  toArr() {
    const ret: number[][] = [];
    for (let y = 0; y < this.height; y++) {
      const arr: number[] = [];
      for (let x = 0; x < this.width; x++) {
        arr.push(this.get(x, y));
      }
      ret.push(arr);
    }
    return ret;
  }
}
