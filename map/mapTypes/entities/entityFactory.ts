import {Entity} from './entity.js';
import IntroCrusher from './introCrusher.js';
import SpawnPoint from './spawnPoint.js';
import Spike, { Direction } from './spike.js';
import Spinner from './spinner.js';

export default class EntityFactory {
  entities: Entity[];
  spawnPoints: SpawnPoint[] = [];

  constructor(entities: any[] | undefined) {
    let ret: Entity[] = [];

    if (!entities) {
      this.entities = ret;
      return;
    }

    for (const entity of entities) {
      switch (entity.__name) {
        case 'spinner':
          ret.push(new Spinner(entity));
          break;
        case 'introCrusher':
          ret.push(new IntroCrusher(entity));
          break;
        case "spikesUp":
          ret.push(new Spike(entity, Direction.Up));
          break;
        case "spikesRight":
          ret.push(new Spike(entity, Direction.Right));
          break;
        case "spikesDown":
          ret.push(new Spike(entity, Direction.Down));
          break;
        case "spikesLeft":
          ret.push(new Spike(entity, Direction.Left));
          break;
        case 'player':
          const player = new SpawnPoint(entity);
          this.spawnPoints.push(player);
          ret.push(player);
          break;

        default:
          ret.push(new Entity(entity));
          break;
      }
    }

    this.entities = ret;
  }
}
