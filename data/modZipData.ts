import {
  // @ts-ignore
  Uint8ArrayWriter,
  Entry,
} from '../node_modules/@zip.js/zip.js/index.js';
import Dialog from './dialog.js';
import {MapZipReader} from './mapReader.js';
import ModData, {AbstractMapData} from './modData.js';

export class ModZipData extends ModData {
  constructor() {
    super();
  }

  async init(entries: Entry[]) {
    for (const entry of entries) {
      if (!entry) {
        console.error('Skipping');
        continue;
      }

      const path = entry.filename;

      if (path.startsWith('Maps/') && path.endsWith('.bin')) {
        this.maps.push(new MapZipData(path, entry));
        continue;
      }
      const dialogMatch = /Dialog\/(?<lang>[A-z]+)\.txt/.exec(path)?.groups;
      if (dialogMatch) {
        const uint8ArrWriter = new Uint8ArrayWriter();
        const dialogData = <Uint8Array>await entry.getData!(uint8ArrWriter);
        this.dialog[dialogMatch.lang] = new Dialog(dialogData);
      }
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

export class MapZipData extends AbstractMapData {
  entry: Entry;

  constructor(path: string, entry: Entry) {
    super(path, new MapZipReader());

    this.entry = entry;
  }
}
