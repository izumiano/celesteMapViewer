import Result from '../../../utils/result.js';
import Sprite from '../../rendering/sprite.js';
import {Vector2} from '../../utils/vector2.js';
import {Entity} from './entity.js';

const oneDashPath = 'refill';
const twoDashPath = 'refillTwo';

export default class Refill extends Entity {
  twoDash: boolean;

  constructor(entity: any) {
    super(entity);

    this.twoDash = entity.twoDash;

    Sprite.add({
      path: this.twoDash ? twoDashPath : oneDashPath,
    });
  }

  async draw(
    ctx: CanvasRenderingContext2D,
    xOffset: number,
    yOffset: number,
    scale: number,
    abortController: AbortController,
  ) {
    const image = Sprite.getImage(this.twoDash ? twoDashPath : oneDashPath);

    const imageScale = new Vector2(image.width * scale, image.height * scale);

    ctx.drawImage(
      image,
      this.x * scale + xOffset - imageScale.x / 2,
      this.y * scale + yOffset - imageScale.y / 2,
      imageScale.x,
      imageScale.y,
    );

    return Result.success();
  }
}
