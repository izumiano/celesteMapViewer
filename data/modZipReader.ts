import {BlobReader, ZipReader} from '../node_modules/@zip.js/zip.js/index.js';
import {ModZipData} from './modZipData.js';

export class ModZipReader {
  async readMod(zip: ArrayBuffer | Response) {
    let blob;

    if (zip instanceof Response) {
      blob = await zip.blob();
    } else {
      blob = new Blob([zip]);
    }

    const zipFileReader = new BlobReader(blob);
    const zipReader = new ZipReader(zipFileReader);

    const entries = await zipReader.getEntries();
    const mapZipData = new ModZipData(entries);

    await zipReader.close();

    return mapZipData;
  }

  static isZip(buffer: ArrayBuffer) {
    if (buffer.byteLength < 4) {
      return false; // Not enough data to be a ZIP file
    }

    const view = new DataView(buffer);
    const magicNumber = view.getUint32(0, false); // Read the first 4 bytes as an unsigned 32-bit integer (big-endian)

    return magicNumber === 0x504b0304;
  }
}
