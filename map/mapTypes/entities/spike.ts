import Result from '../../../utils/result.js';
import {Vector2} from '../../utils/vector2.js';
import {CelesteMap} from '../celesteMap.js';
import {Entity} from './entity.js';

export enum Direction {
  Up,
  Right,
  Down,
  Left,
}

export default class Spike extends Entity {
  static imageDir = window.location + 'assets/spikes/';
  static images: Map<string, HTMLImageElement> = new Map();

  tilingDirection: Vector2;
  tileOffset: Vector2;

  tileCount: number | undefined;
  direction: Direction;

  constructor(entity: any, direction: Direction) {
    super(entity);

    const originX = entity.originX;
    const originY = entity.originY;

    this.direction = direction;
    const size = this.width ? this.width : this.height;
    this.tileCount = size
      ? Math.ceil(size / CelesteMap.tileMultiplier)
      : undefined;

    switch (this.direction) {
      case Direction.Up:
        this.tilingDirection = new Vector2(1, 0);
        this.tileOffset = new Vector2(0, -CelesteMap.tileMultiplier + 1);
        break;
      case Direction.Right:
        this.tilingDirection = new Vector2(0, 1);
        this.tileOffset = new Vector2(-1, 0);
        break;
      case Direction.Down:
        this.tilingDirection = new Vector2(1, 0);
        this.tileOffset = new Vector2(0, -1);
        break;
      case Direction.Left:
        this.tilingDirection = new Vector2(0, 1);
        this.tileOffset = new Vector2(-CelesteMap.tileMultiplier + 1, 0);
        break;
    }

    console.log(entity);
  }

  static async getImage(path: string) {
    if (this.images.has(path)) {
      this.images.get(path);
    }

    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = () => {
        resolve(null);
      };
      image.onerror = () => {
        reject('Failed loading image');
      };
      image.src = this.imageDir + path + '.png';
    });
    this.images.set(path, image);
    return image;
  }

  async draw(
    ctx: CanvasRenderingContext2D,
    xOffset: number,
    yOffset: number,
    scale: number,
  ): Promise<Result<unknown>> {
    if (!this.tileCount) {
      return Result.success();
    }

    const image = await Spike.getImage(
      'default_' + Direction[this.direction].toLowerCase() + '00',
    );

    const tileSize = CelesteMap.tileMultiplier * scale;
    const tilingDirectionSizeX = this.tilingDirection.x * tileSize;
    const tilingDirectionSizeY = this.tilingDirection.y * tileSize;

    for (let i = 0; i < this.tileCount; i++) {
      ctx.drawImage(
        image,
        xOffset +
          (this.x + this.tileOffset.x) * scale +
          tilingDirectionSizeX * i,
        yOffset +
          (this.y + this.tileOffset.y) * scale +
          tilingDirectionSizeY * i,
        tileSize,
        tileSize,
      );
    }

    return Result.success();
  }
}
