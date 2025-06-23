import Result from '../../../utils/result.js';
import {CelesteMap} from '../celesteMap.js';
import {Entity} from './entity.js';

export default class Spinner extends Entity {
  constructor(entity: any) {
    super(entity, -8500);
  }

  async draw(
    ctx: CanvasRenderingContext2D,
    xOffset: number,
    yOffset: number,
    scale: number,
    abortController: AbortController,
  ) {
    ctx.beginPath();
    ctx.arc(
      this.x * scale + xOffset,
      this.y * scale + yOffset,
      CelesteMap.tileMultiplier * scale,
      0,
      Math.PI * 2,
      true,
    );
    ctx.closePath();
    ctx.stroke();

    return Result.success();
  }
}
