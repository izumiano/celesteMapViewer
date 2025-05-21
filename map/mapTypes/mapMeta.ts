export class MapMeta {
  modeMeta: ModeMeta | null = null;

  constructor(meta: any) {
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
  startLevel: string;

  constructor(meta: any) {
    this.startLevel = meta.StartLevel;
  }
}
