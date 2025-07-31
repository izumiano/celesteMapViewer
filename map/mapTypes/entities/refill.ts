import {Entity} from './entity.js';

const oneDashPath = 'refill';
const twoDashPath = 'refillTwo';

export default class Refill extends Entity {
  twoDash: boolean;

  constructor(entity: any) {
    super(entity, {
      depth: 10,
      path: entity.twoDash ? twoDashPath : oneDashPath,
    });

    this.twoDash = entity.twoDash;
  }

  get path() {
    return this.twoDash ? twoDashPath : oneDashPath;
  }
}
