import Actor from './actor.js';
import Refill from './refill.js';
import {Entity} from './entity.js';
import IntroCrusher from './introCrusher.js';
import SpawnPoint from './spawnPoint.js';
import Spike, {Direction} from './spike.js';
import Spinner from './spinner.js';

export default class EntityFactory {
  entities: Actor[];
  spawnPoints: SpawnPoint[] = [];

  constructor(entities: any[] | undefined) {
    let ret: Actor[] = [];

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
        case 'spikesUp':
          ret.push(new Spike(entity, Direction.Up));
          break;
        case 'spikesRight':
          ret.push(new Spike(entity, Direction.Right));
          break;
        case 'spikesDown':
          ret.push(new Spike(entity, Direction.Down));
          break;
        case 'spikesLeft':
          ret.push(new Spike(entity, Direction.Left));
          break;
        case 'player':
          const player = new SpawnPoint(entity);
          this.spawnPoints.push(player);
          ret.push(player);
          break;
        case 'refill':
          ret.push(new Refill(entity));
          break;
        default:
          ret.push(new Entity(entity));
          break;
      }
    }

    this.entities = ret;
  }
}
