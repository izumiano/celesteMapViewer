import Result from '../../utils/result.js';
import {addLeadingZeroes} from '../../utils/utils.js';
import Sprite from '../rendering/sprite.js';
import {Vector2} from '../utils/vector2.js';
import {CelesteMap} from '../mapTypes/celesteMap.js';
import {Entity} from './entity.js';
import NinePatch from '../rendering/ninePatch.js';

const path = 'zipMover/block';
const lightPath = 'zipMover/light';
const nodeCogPath = 'zipMover/cog';

const innerCogCount = 11;

export default class ZipMover extends Entity {
  declare width: number;
  declare height: number;

  private node: Vector2;

  renderedTexture: HTMLCanvasElement | 'pending' | undefined;

  private ninePatch: NinePatch;

  constructor(entity: any) {
    super(entity, {depth: -9999, noPath: true});
    let node = entity.__children.find((child: any) => {
      return child.__name === 'node';
    });
    this.node = new Vector2(node.x, node.y);

    this.ninePatch = new NinePatch(
      this.width / CelesteMap.tileMultiplier,
      this.height / CelesteMap.tileMultiplier,
      path,
    );
  }

  async loadSprites() {
    await Sprite.add({
      path: lightPath,
    });
    await Sprite.add({path: nodeCogPath});

    for (let i = 0; i < innerCogCount; i++) {
      await Sprite.add({path: `zipMover/innercog${addLeadingZeroes(i, 2)}`});
    }

    const fullImage = await Sprite.loadImage(path);

    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        if (Sprite.has(this.getPathFromSpriteCoordsAt(x, y))) {
          continue;
        }

        const image = await window.createImageBitmap(
          fullImage,
          x * CelesteMap.tileMultiplier,
          y * CelesteMap.tileMultiplier,
          CelesteMap.tileMultiplier,
          CelesteMap.tileMultiplier,
        );
        Sprite.add({path: this.getPathFromSpriteCoordsAt(x, y), image: image});
      }
    }
  }

  private getPathFromSpriteCoordsAt(x: number, y: number) {
    return `zipMover/block:${x},${y}`;
  }

  private mod(x: number, m: number) {
    return ((x % m) + m) % m;
  }

  private async createCanvas(
    abortController: AbortController,
  ): Promise<Result<HTMLCanvasElement>> {
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('ctx was undefined');
      return Result.failure(new Error('ctx was undefined'));
    }

    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, this.width, this.height);

    let num = 1;
    let num2 = 0;
    for (let i = 4; i <= this.height - 4; i += 8) {
      const num3 = num;
      for (let j = 4; j <= this.width - 4; j += 8) {
        const index = Math.floor(
          this.mod(num2 / (Math.PI / 2), 1) * innerCogCount,
        );
        const mTexture = Sprite.getImage(
          `zipMover/innercog${addLeadingZeroes(index, 2)}`,
        );
        const rectangle = {
          x: 0,
          y: 0,
          width: mTexture.width,
          height: mTexture.height,
        };
        const zero = new Vector2(0, 0);
        if (j <= 4) {
          zero.x = 2;
          rectangle.x = 2;
          rectangle.width -= 2;
        } else if (j >= this.width - 4) {
          zero.x = -2;
          rectangle.width -= 2;
        }
        if (i <= 4) {
          zero.y = 2;
          rectangle.y = 2;
          rectangle.height -= 2;
        } else if (i >= this.height - 4) {
          zero.y = -2;
          rectangle.height -= 2;
        }
        const drawOffset = new Vector2(
          -Math.min(rectangle.x, 0),
          -Math.min(rectangle.y, 0),
        );
        ctx.filter = `brightness(${num < 0 ? 50 : 100}%)`;
        ctx.drawImage(
          mTexture,
          j + zero.x - mTexture.width / 2 + drawOffset.x,
          i + zero.y - mTexture.height / 2 + drawOffset.y,
          mTexture.width,
          mTexture.height,
        );
        num = -num;
        num2 += Math.PI / 3;
      }
      if (num3 == num) {
        num = -num;
      }
    }

    ctx.filter = 'brightness(100%)';

    this.ninePatch.draw(ctx);

    const lightImage = Sprite.getImage(lightPath);

    const imageScale = new Vector2(lightImage.width, lightImage.height);

    ctx.drawImage(
      lightImage,
      this.width / 2 - imageScale.x / 2,
      0,
      imageScale.x,
      imageScale.y,
    );

    return Result.success(canvas);
  }

  private getCanvas(
    abortController: AbortController,
  ): Result<HTMLCanvasElement | 'pending'> {
    if (this.renderedTexture) {
      return Result.success(this.renderedTexture);
    }

    this.createCanvas(abortController).then(result => {
      if (result.isFailure) {
        this.renderedTexture = undefined;
        return;
      }
      const canvas = result.success;
      this.renderedTexture = canvas;
    });
    this.renderedTexture = 'pending';
    return Result.success('pending');
  }

  async draw(
    ctx: CanvasRenderingContext2D,
    xOffset: number,
    yOffset: number,
    scale: number,
    abortController: AbortController,
  ) {
    const canvasResult = this.getCanvas(abortController);
    if (canvasResult.isFailure) {
      return Result.failure(canvasResult.failure);
    }
    const canvas = canvasResult.success;
    if (canvas === 'pending') {
      return Result.success();
    }

    const nodeCogImg = Sprite.getImage(nodeCogPath);

    try {
      const halfWidth = Math.floor(this.width / 2);
      const halfHeight = Math.floor(this.height / 2);
      const centerNodeX = this.node.x + halfWidth - nodeCogImg.width / 2;
      const centerNodeY = this.node.y + halfHeight - nodeCogImg.height / 2;
      ctx.drawImage(
        nodeCogImg,
        Math.floor(centerNodeX * scale + xOffset),
        Math.floor(centerNodeY * scale + yOffset),
        nodeCogImg.width * scale,
        nodeCogImg.height * scale,
      );

      ctx.drawImage(
        canvas,
        this.x * scale + xOffset,
        this.y * scale + yOffset,
        canvas.width * scale,
        canvas.height * scale,
      );
    } catch (ex) {
      const err = ex as Error;
      console.error(ex);
      if (
        err.name !== 'InvalidStateError' ||
        err.message !==
          'CanvasRenderingContext2D.drawImage: Passed-in canvas is empty'
      ) {
        console.error(ex);
      }
    }

    return Result.success();
  }
}
