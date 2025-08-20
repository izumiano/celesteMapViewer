import Result from '../../utils/result.js';
import Sprite from '../rendering/sprite.js';
import {Vector2} from '../utils/vector2.js';
import Actor from './actor.js';

export class Entity extends Actor {
  name: string;
  x: number;
  y: number;
  width: number | undefined;
  height: number | undefined;

  canvas: HTMLCanvasElement | null = null;

  // constructor(entity: any, depth: number = 0) {
  constructor(
    entity: any,
    data: {depth?: number} & (
      | {noPath: true}
      | {noPath?: false; path: string; defaultPath?: string}
    ) = {depth: 0, noPath: true},
  ) {
    if (!data.depth) {
      data['depth'] = 0;
    }
    super(data.depth);

    this.name = entity.__name;
    this.x = entity.x;
    this.y = entity.y;
    this.width = entity.width;
    this.height = entity.height;

    if (!data.noPath) {
      Sprite.add({
        path: data.path,
      });
    }
  }

  get path(): string | undefined {
    return;
  }

  async draw(
    ctx: CanvasRenderingContext2D,
    xOffset: number,
    yOffset: number,
    scale: number,
    abortController: AbortController,
  ) {
    const path = this.path;
    if (path) {
      const image = Sprite.getImage(path);

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

    // console.warn(this.name, 'is not supported for drawing');
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      this.x * scale + xOffset,
      this.y * scale + yOffset,
      (this.width ?? 1) * scale,
      (this.height ?? 1) * scale,
    );
    return Result.success();
  }
}
