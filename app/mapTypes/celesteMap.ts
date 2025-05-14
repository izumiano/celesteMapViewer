import {Bounds} from '../utils/bounds.js';
import {Vector2} from '../utils/vector2.js';
import {Level} from './level.js';

export class CelesteMap {
  static tileMultiplier = 8;

  name: string;
  package: string;
  levels: Level[];

  constructor(map: {[key: string]: any}) {
    console.debug(map);

    this.name = map.__name;
    this.package = map._package;
    this.levels = Level.toLevelArray(
      map.__children.find(
        (child: {[key: string]: any}) => child.__name === 'levels',
      ).__children,
    );
  }

  calculateBounds() {
    let maxWidth = 0;
    let minWidth = 0;
    let maxHeight = 0;
    let minHeight = 0;
    for (const level of this.levels) {
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
