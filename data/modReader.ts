import Result from '../utils/result.js';
import {ModZipData} from './modZipData.js';
import {ModZipReader} from './modZipReader.js';

export default class ModReader {
  async read(
    modBinData:
      | Promise<Response>
      | Response
      | Promise<ArrayBuffer>
      | ArrayBuffer,
    modZipReader: ModZipReader,
  ): Promise<Result<ModZipData>> {
    console.debug('reading mod');
    try {
      const awaitedModData = await modBinData;
      if (awaitedModData instanceof Response && !awaitedModData.ok) {
        const message = `Error: ${awaitedModData.status} - ${awaitedModData.statusText}`;
        throw new Error(message);
      }
      return Result.success(await modZipReader.readMod(awaitedModData));
    } catch (ex) {
      return Result.failure(ex as Error);
    }
  }
}
