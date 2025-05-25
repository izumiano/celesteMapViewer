import {AbstractMapData, MapData} from './modData.js';
import {
  // @ts-ignore
  Uint8ArrayWriter,
} from '../node_modules/@zip.js/zip.js/index.js';
import {MapZipData} from './modZipData.js';

export abstract class AbstractMapReader {
  abstract readMap(
    mapData: AbstractMapData,
  ): Promise<Uint8Array<ArrayBufferLike>>;
}

export class MapReader extends AbstractMapReader {
  async readMap(mapData: MapData): Promise<Uint8Array<ArrayBufferLike>> {
    return mapData.buffer;
  }

  static async isMap(buffer: ArrayBuffer | File) {
    if (buffer instanceof File) {
      buffer = await buffer.arrayBuffer();
    }

    if (buffer.byteLength < 12) {
      return false; // Not enough data to be a celeste map file
    }

    const int8View = new Uint8Array(buffer);
    let magicNumber = '';
    for (let i = 0; i < 12; i++) {
      magicNumber += int8View[i].toString(16);
    }
    return magicNumber === 'b43454c45535445204d4150'; // byte code for "0bCELESTE MAP" // 0b is hex for 11; the length of the string
  }
}

export class MapZipReader extends AbstractMapReader {
  async readMap(mapData: MapZipData): Promise<Uint8Array<ArrayBufferLike>> {
    const uint8ArrWriter = new Uint8ArrayWriter();
    return await mapData.entry.getData!(uint8ArrWriter);
  }
}
