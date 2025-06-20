import Result from '../../../utils/result.js';
import {CelesteMap} from '../celesteMap.js';

export class Entity {
  name: string;
  x: number;
  y: number;
  width: number | undefined;
  height: number | undefined;

  canvas: HTMLCanvasElement | null = null;

  constructor(entity: any) {
    this.name = entity.__name;
    this.x = entity.x;
    this.y = entity.y;
    this.width = entity.width;
    this.height = entity.height;
  }

  async lazyDraw(ctx: CanvasRenderingContext2D) {
    return Result.failure(new Error('not implemented'));
  }

  async createEntityCanvas(): Promise<Result<HTMLCanvasElement>> {
    const canvas = document.createElement('canvas');
    canvas.width = this.width ?? 0;
    canvas.height = this.height ?? 0;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('ctx was undefined');
      return Result.failure(new Error('ctx was undefined'));
    }
    ctx.imageSmoothingEnabled = false;

    const lazyResult = await this.lazyDraw(ctx);
    if (lazyResult.isFailure) {
      return Result.failure(lazyResult.failure);
    }
    return Result.success(canvas);
  }

  async getEntityCanvas(): Promise<Result<HTMLCanvasElement>> {
    if (this.canvas) {
      return Result.success(this.canvas);
    }

    const canvasResult = await this.createEntityCanvas();
    if (canvasResult.isFailure) {
      return Result.failure(canvasResult.failure);
    }
    const canvas = canvasResult.success;

    this.canvas = canvas;
    return Result.success(canvas);
  }

  async draw(
    ctx: CanvasRenderingContext2D,
    xOffset: number,
    yOffset: number,
    scale: number,
    abortController: AbortController,
  ) {
    console.warn(this.name, 'is not supported for drawing');
    ctx.strokeRect(
      this.x * scale + xOffset,
      this.y * scale + yOffset,
      (this.width ?? 1) * scale,
      (this.height ?? 1) * scale,
    );
    return Result.success();
  }
}
