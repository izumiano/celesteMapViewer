import Result from '../../../utils/result.js';

export default class Actor {
  depth: number;

  constructor(depth: number) {
    this.depth = depth;
  }

  async draw(
    ctx: CanvasRenderingContext2D,
    xOffset: number,
    yOffset: number,
    scale: number,
    abortController: AbortController,
  ) {
    return Result.success();
  }

  async loadSprites() {}
}
