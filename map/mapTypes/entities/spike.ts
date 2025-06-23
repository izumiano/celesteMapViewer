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

// #region direction mappings
const tilingDirections = new Map([
  [Direction.Up, new Vector2(1, 0)],
  [Direction.Right, new Vector2(0, 1)],
  [Direction.Down, new Vector2(1, 0)],
  [Direction.Left, new Vector2(0, 1)],
]);

const spikeOffsets = new Map([
  [Direction.Up, new Vector2(4, 1)],
  [Direction.Right, new Vector2(-1, 4)],
  [Direction.Down, new Vector2(4, -1)],
  [Direction.Left, new Vector2(1, 4)],
]);

const spikeJustifications = new Map([
  [Direction.Up, new Vector2(0.5, 1.0)],
  [Direction.Down, new Vector2(0.5, 0.0)],
  [Direction.Right, new Vector2(0.0, 0.5)],
  [Direction.Left, new Vector2(1.0, 0.5)],
]);

const tentacleOffsets = new Map([
  [Direction.Up, new Vector2(0, 0)],
  [Direction.Right, new Vector2(0, 0)],
  [Direction.Down, new Vector2(0, 0)],
  [Direction.Left, new Vector2(0, 0)],
]);

const tentacleJustifications = new Map([
  [Direction.Up, new Vector2(0.0, 0.5)],
  [Direction.Down, new Vector2(1.0, 0.5)],
  [Direction.Right, new Vector2(0.0, 0.5)],
  [Direction.Left, new Vector2(1.0, 0.5)],
]);

const tentacleRotations = new Map([
  [Direction.Up, 0],
  [Direction.Down, Math.PI],
  [Direction.Right, Math.PI / 2],
  [Direction.Left, (Math.PI * 3) / 2],
]);
// #endregion

export default class Spike extends Entity {
  static imageDir = window.location + 'assets/spikes/';
  static images: Map<string, HTMLImageElement> = new Map();

  id: number;
  direction: Direction;
  type: 'default' | 'outline' | 'cliffside' | 'reflection' | 'tentacles';
  length: number;

  justification: Vector2;
  offset: Vector2;

  step = 16;

  constructor(entity: any, direction: Direction) {
    super(entity, -1);

    this.id = entity.id;
    this.type = entity.type;
    this.direction = direction;

    this.length = this.width ?? this.height ?? CelesteMap.tileMultiplier;
    this.step = this.type === 'tentacles' ? 16 : 8;

    this.justification = this.getJustification(this.type, direction);
    this.offset = this.getOffset(this.type, direction);
  }

  static async #getImage(type: string, direction: Direction) {
    const path =
      type !== 'tentacles'
        ? `${type}_${Direction[direction].toLowerCase()}00`
        : `${type}00`;
    if (this.images.has(path)) {
      return this.images.get(path)!;
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

  static async getImage(type: string, direction: Direction) {
    const path = `${type}_${Direction[direction].toLowerCase()}00`;
    if (this.images.has(path)) {
      return this.images.get(path)!;
    }

    let image = new Image();
    try {
      image = await this.#getImage(type, direction);
    } catch (ex) {
      console.warn(ex);
      image = await this.#getImage('default', direction);
    }
    this.images.set(path, image);
    return image;
  }

  getJustification(type: string, direction: Direction) {
    if (type === 'tentacles') {
      return tentacleJustifications.get(direction)!;
    }
    return spikeJustifications.get(direction)!;
  }

  getOffset(type: string, direction: Direction) {
    if (type === 'tentacles') {
      return tentacleOffsets.get(direction)!;
    }
    return spikeOffsets.get(direction)!;
  }

  async draw(
    ctx: CanvasRenderingContext2D,
    xOffset: number,
    yOffset: number,
    scale: number,
    abortController: AbortController,
  ): Promise<Result<unknown>> {
    const image = await Spike.getImage(this.type, this.direction);
    const tilingDirection = tilingDirections.get(this.direction)!;

    const imageSize = new Vector2(image.width * scale, image.height * scale);

    if (abortController.signal.aborted) {
      return Result.failure(abortController.signal.reason);
    }

    const isTentacles = this.type === 'tentacles';

    ctx.save();

    ctx.translate(imageSize.x / 2, imageSize.y / 2);

    const translate = new Vector2(
      xOffset +
        this.x * scale -
        imageSize.x * this.justification.x +
        this.offset.x * scale,
      yOffset +
        this.y * scale -
        imageSize.y * this.justification.y +
        this.offset.y * scale,
    );
    if (isTentacles) {
      ctx.rotate(tentacleRotations.get(this.direction)!);
      const x = translate.x;
      const y = translate.y;
      switch (this.direction) {
        case Direction.Up:
          translate.x = x;
          translate.y = y;
          break;
        case Direction.Right:
          translate.x = y;
          translate.y = -x;
          break;
        case Direction.Down:
          translate.x = -x;
          translate.y = -y;
          break;
        case Direction.Left:
          translate.x = -y;
          translate.y = x;
          break;
        default:
          break;
      }
    }
    ctx.translate(translate.x, translate.y);
    ctx.translate(-imageSize.x / 2, -imageSize.y / 2);

    for (let i = 0; i < this.length - 1; i += this.step) {
      ctx.save();
      if (i === this.length - this.step / 2) {
        const moveDist = (this.step * scale) / 2;
        ctx.translate(
          -moveDist * tilingDirection.x,
          moveDist * tilingDirection.y,
        );
      } else if (isTentacles) {
        switch (this.direction) {
          case Direction.Right:
            ctx.translate(
              CelesteMap.tileMultiplier * scale,
              CelesteMap.tileMultiplier * scale,
            );
            break;
          case Direction.Down:
            ctx.translate(-2 * CelesteMap.tileMultiplier * scale, 0);
            break;
          case Direction.Left:
            ctx.translate(
              -CelesteMap.tileMultiplier * scale,
              CelesteMap.tileMultiplier * scale,
            );
            break;
          default:
            break;
        }
      }
      if (!isTentacles) {
        ctx.drawImage(
          image,
          tilingDirection.x * i * scale,
          tilingDirection.y * i * scale,
          imageSize.x,
          imageSize.y,
        );
      } else {
        const dir =
          this.direction === Direction.Down || this.direction === Direction.Left
            ? -1
            : 1;
        ctx.drawImage(image, i * scale * dir, 0, imageSize.x, imageSize.y);
      }
      ctx.restore();
    }
    ctx.restore();

    return Result.success();
  }
}
