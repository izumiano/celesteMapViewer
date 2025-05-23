import {Bounds} from '../utils/bounds.js';
import {Vector2} from '../utils/vector2.js';
import {Level} from './level.js';
import {MapMeta} from './mapMeta.js';

export class CelesteMap {
  static tileMultiplier = 8;

  name: string;
  package: string;
  levels: Map<string, Level> = new Map();
  meta: MapMeta | null = null;

  constructor(map: {[key: string]: any}) {
    console.debug(map);

    this.name = map.__name;
    this.package = map._package;

    const children = map.__children;
    for (const child of children) {
      switch (child.__name) {
        case 'levels':
          this.levels = Level.toLevelSet(child.__children);
          break;
        case 'meta':
          this.meta = new MapMeta(child);
          break;
      }
    }

    const modeMeta = this.meta?.modeMeta;
    if (modeMeta && !modeMeta.startLevel) {
      if (this.levels.size <= 0) {
        return;
      }

      // TODO: Get the real startLevel when it isn't set in the metadata
      const levelsIterator = this.levels.entries();
      for (const [_, level] of levelsIterator) {
        if (level.spawnPoints.length > 0) {
          modeMeta.startLevel = level.name;
          break;
        }
      }
    }
  }

  getStartLevel() {
    const startLevelName = this.meta?.modeMeta?.startLevel;
    if (!startLevelName) {
      console.error(`start level name not found for [${this.package}]`);
      return null;
    }

    const startLevel = this.levels.get(startLevelName);
    if (!startLevel) {
      console.error(
        `start level not found for [${this.name}] [${startLevelName}]`,
      );
      return null;
    }

    return startLevel;
  }

  calculateBounds() {
    let maxWidth = 0;
    let minWidth = 0;
    let maxHeight = 0;
    let minHeight = 0;
    for (const level of this.levels.values()) {
      const tiles = level.solids;
      if (!tiles) {
        console.error('Tiles was undefined');
        continue;
      }

      maxWidth = Math.max(
        maxWidth,
        level.x + tiles.width * CelesteMap.tileMultiplier,
      );
      minWidth = Math.min(minWidth, level.x);
      maxHeight = Math.max(
        maxHeight,
        level.y + tiles.height * CelesteMap.tileMultiplier,
      );
      minHeight = Math.min(minHeight, level.y);
    }

    return new Bounds(
      new Vector2(minWidth, minHeight),
      new Vector2(maxWidth, maxHeight),
    );
  }
}
