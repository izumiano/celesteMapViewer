import {TileMatrix} from './tileMatrix.js';

export class CelesteMap {
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
}

class Level {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;

  objTiles: string | undefined = undefined;
  solids: TileMatrix | undefined = undefined;
  bg: string | undefined = undefined;
  bgTiles: string | undefined = undefined;
  fgTiles: string | undefined = undefined;
  bgDecals: {[key: string]: any} | undefined = undefined;
  fgDecals: {[key: string]: any} | undefined = undefined;
  triggers: {[key: string]: any} | undefined = undefined;
  entities: {[key: string]: any} | undefined = undefined;

  static toLevelArray(levels: {[key: string]: any}): Level[] {
    const ret: Level[] = [];

    for (const [_, level] of levels.entries()) {
      ret.push(new Level(level));
    }

    return ret;
  }

  constructor(level: {[key: string]: any}) {
    this.name = level.name;
    this.x = level.x;
    this.y = level.y;
    this.width = level.width;
    this.height = level.height;

    for (const child of level.__children) {
      const childType = child.__name;
      switch (childType) {
        case 'objtiles':
          this.objTiles = child.innerText;
          break;
        case 'solids':
          this.solids = new TileMatrix(child.innerText);
          break;
        case 'bg':
          this.bg = child.innerText;
          break;
        case 'bgtiles':
          this.bgTiles = child.innerText;
          break;
        case 'fgtiles':
          this.fgTiles = child.innerText;
          break;
        case 'bgdecals':
          this.bgDecals = child;
          break;
        case 'fgdecals':
          this.fgDecals = child;
          break;
        case 'triggers':
          this.triggers = child;
          break;
        case 'entities':
          this.entities = child;
          break;
        default:
          console.error(`unknows level child type ${childType}`);
          break;
      }
    }
  }
}
