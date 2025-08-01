import Result from '../../../utils/result.js';
import {addLeadingZeroes} from '../../../utils/utils.js';
import Sprite from '../../rendering/sprite.js';
import {Vector2} from '../../utils/vector2.js';
import {CelesteMap} from '../celesteMap.js';
import {Entity} from './entity.js';

const path = 'zipMover/block';
const lightPath = 'zipMover/light';

const innerCogCount = 11;

export default class ZipMover extends Entity {
  declare width: number;
  declare height: number;

  tileWidth: number;
  tileHeight: number;

  children: [];

  renderedTexture: HTMLCanvasElement | 'pending' | undefined;

  constructor(entity: any) {
    super(entity, {depth: -9999, noPath: true});

    this.tileWidth = this.width / CelesteMap.tileMultiplier;
    this.tileHeight = this.height / CelesteMap.tileMultiplier;

    this.children = entity.__children;
  }

  async loadSprites() {
    await Sprite.add({
      path: lightPath,
    });

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

  private getPathFromRealCoordsAt(x: number, y: number) {
    let spriteX, spriteY;
    if (x === 0) {
      spriteX = 0;
    } else if (x === this.tileWidth - 1) {
      spriteX = 2;
    } else {
      spriteX = 1;
    }

    if (y === 0) {
      spriteY = 0;
    } else if (y === this.tileHeight - 1) {
      spriteY = 2;
    } else {
      spriteY = 1;
    }

    return `zipMover/block:${spriteX},${spriteY}`;
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

    for (let yW = 0; yW < this.tileHeight; yW++) {
      for (let xW = 0; xW < this.tileWidth; xW++) {
        const image = Sprite.getImage(this.getPathFromRealCoordsAt(xW, yW));

        const imageScale = new Vector2(image.width, image.height);

        ctx.drawImage(
          image,
          xW * CelesteMap.tileMultiplier,
          yW * CelesteMap.tileMultiplier,
          imageScale.x,
          imageScale.y,
        );
      }
    }

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

    try {
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
