import {AbstractMapReader, MapReader} from './mapReader.js';

export default class ModData {
  maps: AbstractMapData[];

  constructor(maps: AbstractMapData[] = []) {
    this.maps = maps;
  }
}

export class AbstractMapData {
  name: string;
  path: string;

  reader: AbstractMapReader;

  constructor(path: string | null, reader: AbstractMapReader) {
    this.path = path ?? 'Map';
    this.name = this.#getName(this.path);
    this.reader = reader;
  }

  async readMap(): Promise<Uint8Array<ArrayBufferLike>> {
    return this.reader.readMap(this);
  }

  #getName(path: string) {
    const lastIndexOfSlash = path.lastIndexOf('/');
    let lastIndexOfDot = path.lastIndexOf('.');

    lastIndexOfDot = lastIndexOfDot === -1 ? path.length - 1 : lastIndexOfDot;

    return path.substring(lastIndexOfSlash + 1, lastIndexOfDot);
  }
}

export class MapData extends AbstractMapData {
  buffer: Uint8Array;

  constructor(path: string | null, buffer: Uint8Array | ArrayBuffer) {
    super(path, new MapReader());

    if (buffer instanceof ArrayBuffer) {
      this.buffer = new Uint8Array(buffer);
    } else {
      this.buffer = buffer;
    }
  }
}
