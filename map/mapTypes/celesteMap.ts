import {Bounds} from '../utils/bounds.js';
import {Vector2} from '../utils/vector2.js';
import {Level} from './level.js';
import {MapMeta} from './mapMeta.js';

export class CelesteMap {
  static tileMultiplier = 8;

  name: string;
  package: string;
  levels: Map<string, Level> = new Map();
  meta: MapMeta;

  constructor(map: {[key: string]: any}) {
    console.debug(map);

    this.name = map.__name;
    this.package = map._package;

    let meta;

    const children = map.__children;
    for (const child of children) {
      switch (child.__name) {
        case 'levels':
          this.levels = Level.toLevelSet(child.__children);
          break;
        case 'meta':
          meta = new MapMeta(child);
          break;
      }
    }

    if (!meta) {
      meta = new MapMeta();
    }
    this.meta = meta;

    const modeMeta = this.meta.modeMeta;
    if (modeMeta && !modeMeta.startLevel) {
      if (this.levels.size <= 0) {
        console.warn('Map has no levels');
        return;
      }

      let minDist = Infinity;
      const zero = new Vector2(0, 0);
      for (const [_, level] of this.levels.entries()) {
        if (level.spawnPoints.length > 0) {
          const pos = new Vector2(level.x, level.y);
          const dist = pos.distance(zero);
          if (dist < minDist) {
            modeMeta.startLevel = level.name;
            minDist = dist;
          }
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
