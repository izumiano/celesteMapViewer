import {dialogKeyify} from '../../utils/utils.js';

export class MapMeta {
  modeMeta: ModeMeta | null = null;

  constructor(meta: any = null) {
    if (!meta) {
      this.modeMeta = new ModeMeta();
      return;
    }

    const children = meta.__children;

    for (const child of children) {
      switch (child.__name) {
        case 'mode':
          this.modeMeta = new ModeMeta(child);
          break;
      }
    }
  }
}

class ModeMeta {
  startLevel: string | undefined;

  constructor(meta: any = null) {
    if (!meta) {
      this.startLevel = undefined;
      return;
    }

    this.startLevel = meta.StartLevel
      ? dialogKeyify(meta.StartLevel)
      : undefined;
  }
}
