import {TilesetInfo} from '../rendering/tileset.js';
import {Bounds} from '../utils/bounds.js';
import {Vector2} from '../utils/vector2.js';
import {Level} from './level.js';
import {MapMeta} from './mapMeta.js';
import {Tile} from './tileMatrix.js';

export class CelesteMap {
  static tileMultiplier = 8;

  name: string;
  package: string;
  levels: Map<string, Level> = new Map();
  meta: MapMeta;
  bounds: Bounds = new Bounds(new Vector2(0, 0), new Vector2(0, 0));

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

    this.bounds = this.calculateBounds();
    this.levels.forEach(level => {
      level.solids?.autoTile(this, level);
    });
  }

  getLevelAt(pos: Vector2) {
    for (const [_, level] of this.levels) {
      if (
        pos.x >= level.x &&
        pos.x <= level.x + level.width - 1 &&
        pos.y >= level.y &&
        pos.y <= level.y + level.height - 1
      ) {
        return level;
      }
    }
    return null;
  }

  /**
   *
   * @param pos A world space tile grid position
   */
  getTileAt(pos: Vector2) {
    const levelSpacePos = new Vector2(
      pos.x * CelesteMap.tileMultiplier + this.bounds.left,
      pos.y * CelesteMap.tileMultiplier + this.bounds.top,
    );
    const level = this.getLevelAt(levelSpacePos);

    if (!level) {
      return new Tile('o'.charCodeAt(0));
    }

    const levelGridPos = new Vector2(
      pos.x - (level.x - this.bounds.left) / CelesteMap.tileMultiplier,
      pos.y - (level.y - this.bounds.top) / CelesteMap.tileMultiplier,
    );
    return level.solids?.get(levelGridPos.x, levelGridPos.y) ?? Tile.air();
  }

  /**
   *
   * @param pos A world space tile grid position
   */
  isSolidAt(pos: Vector2, voidIsSolid = true) {
    const tile = this.getTileAt(pos);

    if (!tile) {
      return voidIsSolid;
    }

    return tile.isSolid();
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

      maxWidth = Math.max(maxWidth, level.x + level.width);
      minWidth = Math.min(minWidth, level.x);
      maxHeight = Math.max(maxHeight, level.y + level.height);
      minHeight = Math.min(minHeight, level.y);
    }

    return new Bounds(
      new Vector2(minWidth, minHeight),
      new Vector2(maxWidth, maxHeight),
    );
  }
}
