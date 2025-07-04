import {dialogKeyify} from '../utils/utils.js';
import Dialog from './dialog.js';
import {AbstractMapReader, MapReader} from './mapReader.js';

export default class ModData {
  maps: AbstractMapData[];
  dialog: {[key: string]: Dialog};

  constructor(
    maps: AbstractMapData[] = [],
    dialog: {[key: string]: Dialog} = {},
  ) {
    this.maps = maps;
    this.dialog = dialog;
  }

  concat(mod: ModData) {
    this.maps = this.maps.concat(mod.maps);
    for (const dialogLang in mod.dialog) {
      const dialog = mod.dialog[dialogLang];
      if (this.dialog[dialogLang]) {
        this.dialog[dialogLang].concat(dialog);
      } else {
        this.dialog[dialogLang] = dialog;
      }
    }
  }
}

export class AbstractMapData {
  name: string;
  path: string;
  dialogKey: string;

  reader: AbstractMapReader;

  constructor(path: string | null, reader: AbstractMapReader) {
    this.path = path ?? 'Map';
    if (this.path.startsWith('Maps/')) {
      this.path = this.path.replace('Maps/', '');
    }
    this.name = this.#getName(this.path);
    let dialogKey = this.path;
    if (dialogKey.endsWith('.bin')) {
      dialogKey = dialogKey.slice(0, dialogKey.length - 4);
    }
    this.dialogKey = dialogKeyify(dialogKey);

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
