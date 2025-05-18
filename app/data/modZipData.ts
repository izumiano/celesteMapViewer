import {Entry} from '../../node_modules/@zip.js/zip.js/index.js';

export class ModZipData {
  maps: MapZipData[] = [];

  constructor(entries: Entry[]) {
    this.#populate(entries);
  }

  async #populate(entries: Entry[]) {
    for (const entry of entries) {
      if (!entry) {
        console.error('Skipping');
        continue;
      }

      const path = entry.filename;

      if (!path.startsWith('Maps/') || !path.endsWith('.bin')) {
        continue;
      }

      this.maps.push(new MapZipData(path, entry));
    }
  }
}

export class MapZipData {
  name: string;
  path: string;

  entry: Entry;

  constructor(path: string, entry: Entry) {
    this.path = path;
    this.entry = entry;

    this.name = this.#getName(path);
  }

  #getName(path: string) {
    const lastIndexOfSlash = path.lastIndexOf('/');
    const lastIndexOfDot = path.lastIndexOf('.');

    if (lastIndexOfSlash === -1 || lastIndexOfDot === -1) {
      return path;
    }

    return path.substring(lastIndexOfSlash + 1, lastIndexOfDot);
  }
}
