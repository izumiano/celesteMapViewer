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

    this.maps.sort((a, b) => {
      // Number sort
      const aNumStr = a.name.match(/\d+/)?.[0];
      const aNum = Number(aNumStr);
      const bNumStr = b.name.match(/\d+/)?.[0];
      const bNum = Number(bNumStr);

      if (aNumStr && bNumStr) {
        if (aNum < bNum) {
          return -1;
        }
        if (aNum > bNum) {
          return 1;
        }
      }

      // Fallback string sort
      const nameA = a.name.substring(aNumStr?.length ?? 0).toUpperCase();
      const nameB = b.name.substring(bNumStr?.length ?? 0).toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }

      return 0;
    });
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
