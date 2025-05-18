import {
  BlobReader,
  BlobWriter,
  // @ts-ignore
  Uint8ArrayWriter,
  TextReader,
  TextWriter,
  ZipReader,
  ZipWriter,
} from '../../node_modules/@zip.js/zip.js/index.js';
import {MapZipData, ModZipData} from './modZipData.js';

export class ModZipReader {
  zipPath: string;

  constructor(zipPath: string) {
    this.zipPath = zipPath;
  }

  async readMod() {
    const blob = await (await fetch(this.zipPath)).blob();
    const zipFileReader = new BlobReader(blob);
    const zipReader = new ZipReader(zipFileReader);

    const entries = await zipReader.getEntries();
    const mapZipData = new ModZipData(entries);

    await zipReader.close();

    return mapZipData;
  }

  async readMap(mapZipData: MapZipData): Promise<Uint8Array<ArrayBufferLike>> {
    const uint8ArrWriter = new Uint8ArrayWriter();
    return await mapZipData.entry.getData!(uint8ArrWriter);
  }
}
