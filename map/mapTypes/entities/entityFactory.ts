import {Entity} from './entity.js';
import SpawnPoint from './spawnPoint.js';
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
