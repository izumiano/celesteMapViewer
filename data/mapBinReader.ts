import {CelesteMap} from '../map/mapTypes/celesteMap.js';
import {mapLoadingProgress} from '../utils/progressTracker.js';

export class MapBinReader {
  #bytes: Uint8Array<ArrayBufferLike> = new Uint8Array(0);
  #index = 0;

  async decodeData(data: Uint8Array<ArrayBufferLike>) {
    mapLoadingProgress.set(0.1, 'decoding map binary');

    this.#bytes = data;
    return await this.#decode();
  }

  async decodeFile(file: RequestInfo) {
    const buffer = await (await fetch(file)).arrayBuffer();
    this.#bytes = new Uint8Array(buffer);

    return await this.#decode();
  }

  async #decode() {
    console.log(this.#bytes);
    const header = this.readString();
    if (header !== 'CELESTE MAP') {
      throw new Error('Invalid Celeste Map File');
    }

    const modPackage = this.readString();

    const lookupLength = this.readShort();
    let lookup: string[] = [];

    for (let i = 0; i < lookupLength; i++) {
      lookup.push(this.readString());
    }

    const ret: {[key: string]: any} = this.decodeElement(lookup);
    ret._package = modPackage;

    const map = new CelesteMap(ret);
    await map.init();
    return map;
  }

  decodeValue(lookup: string[], typ: number) {
    switch (typ) {
      case 0:
        return this.readBool();
      case 1:
        return this.readByte();
      case 2:
        return this.readSignedShort();
      case 3:
        return this.readSignedLong();
      case 4:
        return this.readFloat();
      case 5:
        return this.look(lookup);
      case 6:
        return this.readString();
      case 7:
        return this.readRunLengthEncoded();
      default:
        throw new Error(`unsupported value decoder ${typ}`);
    }
  }

  decodeElement(lookup: string[]) {
    const ret: {[key: string]: any}[] = [];

    const stack: {[key: string]: any}[][] = [];
    stack.push(ret);

    while (stack.length > 0) {
      const name = this.look(lookup);
      const parent = stack.pop()!;
      const element: {[key: string]: any} = {};
      parent.push(element);
      element.__name = name;
      const attributeCount = this.readByte();

      for (let i = 0; i < attributeCount; i++) {
        const key = this.look(lookup);
        const typ = this.readByte();

        const value = this.decodeValue(lookup, typ);

        if (key) {
          element[key] = value;
        }
      }

      const elementCount = this.readShort();

      if (elementCount > 0) {
        element.__children = [];

        for (let i = 0; i < elementCount; i++) {
          stack.push(element.__children);
        }
      }
    }

    return ret[0];
  }

  look(lookup: string[]) {
    return lookup[this.readShort()];
  }

  twosCompliment(n: number, power: number) {
    if (n >= 2 ** (power - 1)) {
      return n - 2 ** power;
    } else {
      return n;
    }
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

  readBool(): boolean {
    const ret = this.readByte() != 0;
    return ret;
  }

  readString(): string {
    let length = this.readVariableLength();
    let res = this.read(length);

    const ret = this.bytesToString(res);
    return ret;
  }

  bytesToString(bytes: Uint8Array): string {
    return this.#chunkedStringFromCharCode(bytes);
  }

  #chunkedStringFromCharCode(codes: Uint8Array): string {
    const chunkSize = 5000;
    let result = '';
    for (let i = 0; i < codes.length; i += chunkSize) {
      const chunk = codes.slice(i, i + chunkSize);
      result += String.fromCharCode(...chunk);
    }
    return result;
  }

  readFloat() {
    const [b4, b3, b2, b1] = this.read(4);
    const exponent = (b1 % 128) * 2 + Math.floor(b2 / 128);

    if (exponent == 0) {
      return 0.0;
    }

    const sign = b1 > 127 ? -1 : 1;
    let mantissa = ((b2 % 128) * 256 + b3) * 256 + b4;

    // Infinity/NaN check
    // Eight 1s in exponent is infinity/NaN
    if (exponent == 255) {
      if (mantissa == 0) {
        return Number.POSITIVE_INFINITY * sign;
      } else {
        return 0 / 0;
      }
    }

    mantissa = (this.ldExp(mantissa, -23) + 1) * sign;

    const ret = this.ldExp(mantissa, exponent - 127);
    return ret;
  }

  readShort() {
    let [b1, b2] = this.read(2);

    const ret = b1 + b2 * 256;
    return ret;
  }

  readSignedShort() {
    const ret = this.twosCompliment(this.readShort(), 16);
    return ret;
  }

  readLong() {
    const [b1, b2, b3, b4] = this.read(4);

    const ret = b1 + b2 * 256 + b3 * 65536 + b4 * 16777216;
    return ret;
  }

  readSignedLong() {
    const ret = this.twosCompliment(this.readLong(), 32);
    return ret;
  }

  readRunLengthEncoded() {
    const bytes = this.readShort();
    let ret: string = '';

    for (let i = 0; i < bytes; i += 2) {
      const [times, char] = this.read(2);

      ret += String.fromCharCode(char).repeat(times);
    }

    return ret;
  }

  ldExp(m: number, n: number) {
    return (m * 2) ^ n;
  }
}
