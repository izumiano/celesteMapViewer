import {Entity} from './entity.js';

export default class SpawnPoint extends Entity {
  constructor(entity: any) {
    super(entity, {depth: 0, noPath: true});
  }
}
