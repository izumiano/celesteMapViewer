import {Entity} from './entities/entity.js';
import EntityFactory from './entities/entityFactory.js';
import SpawnPoint from './entities/spawnPoint.js';
import {TileMatrix} from './tileMatrix.js';

export class Level {
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
  entities: Entity[] = [];

  spawnPoints: SpawnPoint[] = [];

  static toLevelSet(levels: {[key: string]: any}): Map<string, Level> {
    const ret: Map<string, Level> = new Map();

    for (const [_, _level] of levels.entries()) {
      const level = new Level(_level);
      ret.set(level.name, level);
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
          const entityFactory = new EntityFactory(child.__children);
          this.entities = entityFactory.entities;
          this.spawnPoints = entityFactory.spawnPoints;
          break;
        default:
          console.error(`unknows level child type ${childType}`);
          break;
      }
    }
  }
}
