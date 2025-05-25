import Result from '../utils/result.js';
import {MapReader} from './mapReader.js';
import ModData, {AbstractMapData, MapData} from './modData.js';
import {ModZipReader} from './modZipReader.js';

export class ModReader {
  async read(
    modBinData:
      | Promise<Response>
      | Response
      | Promise<ArrayBuffer>
      | ArrayBuffer
      | File,
  ): Promise<Result<ModData>> {
    console.debug('reading mod');
    let awaitedModData = await modBinData;
    if (awaitedModData instanceof Response) {
      if (!awaitedModData.ok) {
        const message = `Error: ${awaitedModData.status} - ${awaitedModData.statusText}`;
        return Result.failure(new Error(message));
      }
      awaitedModData = await awaitedModData.arrayBuffer();
    }
    return this.#read(awaitedModData);
  }

  async #read(modBinData: ArrayBuffer | File): Promise<Result<ModData>> {
    let filename: string | null = null;
    if (modBinData instanceof File) {
      filename = modBinData.name;
    }

    const modBuffer =
      modBinData instanceof File ? await modBinData.arrayBuffer() : modBinData;

    if (ModZipReader.isZip(modBuffer)) {
      const modZipReader = new ModZipReader();
      return Result.success(await modZipReader.readMod(modBuffer));
    }
    if (await MapReader.isMap(modBuffer)) {
      const modData = new ModData([new MapData(filename, modBuffer)]);
      return Result.success(modData);
    }
    return Result.failure(new Error('modBinData was not any readable type'));
  }
}
