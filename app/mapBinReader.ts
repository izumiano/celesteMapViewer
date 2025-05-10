export class MapBinReader {
  #bytes = new Uint8Array(0);
  #index = 0;

  async decodeFile(file: RequestInfo) {
    let buffer = await (await fetch(file)).arrayBuffer();
    this.#bytes = new Uint8Array(buffer);

    console.log(this.#bytes);
    for (let i = 0; i < 100; i++) {
      console.log(this.readString());
    }

    console.log(this.readString());
  }

  read(length: number): Uint8Array {
    const ret = this.#bytes.slice(this.#index, this.#index + length);
    this.#index += length;
    return ret;
  }

  readVariableLength() {
    let res = 0;
    let multiplier = 1;

    while (true) {
      const byte = this.readByte();

      if (byte < 128) {
        return res + byte * multiplier;
      } else {
        res = res + (byte - 128) * multiplier;
      }

      multiplier = multiplier * 128;
    }
  }

  readByte() {
    if (this.#index < this.#bytes.length) {
      return this.#bytes[this.#index++];
    } else {
      throw new Error('index was outside the bounds of the array');
    }
  }

  readString(): string {
    let length = this.readVariableLength();
    let res = this.read(length);

    return this.bytesToString(res);
  }

  bytesToString(bytes: Uint8Array): string {
    return String.fromCharCode(...bytes);
  }
}
