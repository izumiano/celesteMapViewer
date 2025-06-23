import Actor from './entities/actor.js';
import {Entity} from './entities/entity.js';
import EntityFactory from './entities/entityFactory.js';
import SolidsContainer from './entities/solidsContainer.js';
import SpawnPoint from './entities/spawnPoint.js';
import {TileMatrix} from './tileMatrix.js';

export class Level {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;

  objTiles: string | undefined;
  solids: SolidsContainer | undefined;
  bg: string | undefined;
  bgTiles: string | undefined;
  fgTiles: string | undefined;
  bgDecals: {[key: string]: any} | undefined;
  fgDecals: {[key: string]: any} | undefined;
  triggers: {[key: string]: any} | undefined;
  entities: Entity[] = [];

  spawnPoints: SpawnPoint[] = [];

  actors: Actor[] = [];

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
          this.solids = new SolidsContainer(
            this,
            TileMatrix.createFromString(child.innerText, this),
          );
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

    const actors: Actor[] = [];
    for (const entity of this.entities) {
      actors.push(entity);
    }
    this.solids && actors.push(this.solids);

    this.actors = actors.sort((actorA, actorB) => {
      if (actorA.depth < actorB.depth) {
        return 1;
      } else if (actorA.depth > actorB.depth) {
        return -1;
      }
      return 0;
    });
  }
}
