import Result from '../../utils/result.js';
import {addLeadingZeroes} from '../../utils/utils.js';
import Sprite from '../rendering/sprite.js';
import {Vector2} from '../utils/vector2.js';
import {CelesteMap} from '../mapTypes/celesteMap.js';
import {Entity} from './entity.js';
import NinePatch from '../rendering/ninePatch.js';
import {drawImageBrightness} from '../rendering/utils.js';

const blockPath = 'zipMover/$/block';
const lightPath = 'zipMover/$/light';
const nodeCogPath = 'zipMover/$/cog';

const ropeColor = '#663931';
const ropeLightColor = '#9b6157';

const innerCogPath = 'zipMover/$/innercog';

type Theme = 'Normal' | 'Moon';

function getRealPath(path: string, theme: Theme) {
  return path.replace('$', theme);
}

export class ZipMoverPath extends Entity {
  private halfWidth: number;
  private halfHeight: number;

  private from: Vector2;
  private to: Vector2;

  private theme: Theme;

  constructor(entity: any, zipMover: ZipMover) {
    super(entity, {depth: 5000, noPath: true});
    let node = entity.__children.find((child: any) => {
      return child.__name === 'node';
    });
    this.x = node.x;
    this.y = node.y;

    this.halfWidth = Math.floor(zipMover.width / 2);
    this.halfHeight = Math.floor(zipMover.height / 2);

    this.from = new Vector2(
      zipMover.x + this.halfWidth,
      zipMover.y + this.halfHeight,
    );
    this.to = new Vector2(this.x + this.halfWidth, this.y + this.halfHeight);

    this.theme = zipMover.theme;
  }

  async loadSprites() {
    await Sprite.add({path: getRealPath(nodeCogPath, this.theme)});
  }

  drawNodeCog(
    ctx: CanvasRenderingContext2D,
    xOffset: number,
    yOffset: number,
    scale: number,
    cogOffset: Vector2,
    darken: boolean = false,
  ) {
    const nodeCogImg = Sprite.getImage(getRealPath(nodeCogPath, this.theme));

    const centerNodeX =
      this.x + this.halfWidth - nodeCogImg.width / 2 + cogOffset.x;
    const centerNodeY =
      this.y + this.halfHeight - nodeCogImg.height / 2 + cogOffset.y;

    drawImageBrightness(
      ctx,
      nodeCogImg,
      new Vector2(
        Math.floor(centerNodeX * scale + xOffset),
        Math.floor(centerNodeY * scale + yOffset),
      ),
      scale,
      darken ? 0 : 1,
    );
  }

  private drawLine(
    ctx: CanvasRenderingContext2D,
    scale: number,
    offset: Vector2,
    from: Vector2,
    to: Vector2,
    color: string = 'red',
  ) {
    from = from.multiply(scale).add(new Vector2(offset.x, offset.y));
    to = to.multiply(scale).add(new Vector2(offset.x, offset.y));

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = scale;
    ctx.moveTo(Math.floor(from.x), Math.floor(from.y)); // Offset by 0.5 for crisp 1px line
    ctx.lineTo(Math.floor(to.x), Math.floor(to.y));
    ctx.stroke();
  }

  private drawCogs(
    ctx: CanvasRenderingContext2D,
    xOffset: number,
    yOffset: number,
    scale: number,
    cogOffset: Vector2,
    color: string | null = null,
  ) {
    const levelOffset = new Vector2(xOffset, yOffset);

    const vector = new Vector2(
      this.to.x - this.from.x,
      this.to.y - this.from.y,
    ).safeNormalize();
    const vector2 = vector.perpendicular().multiply(4);
    const vector3 = vector.perpendicular().multiply(-4);

    this.drawLine(
      ctx,
      scale,
      levelOffset,
      this.from.add(vector2).add(cogOffset),
      this.to.add(vector2).add(cogOffset),
      color ?? ropeColor,
    );
    this.drawLine(
      ctx,
      scale,
      levelOffset,
      this.from.add(vector3).add(cogOffset),
      this.to.add(vector3).add(cogOffset),
      color ?? ropeColor,
    );
    for (let num = 4; num < this.to.subtract(this.from).magnitude(); num += 4) {
      const vector4 = this.from
        .add(vector2)
        .add(vector.perpendicular())
        .add(vector.multiply(num));
      const vector5 = this.to
        .add(vector.perpendicular().multiply(-5))
        .subtract(vector.multiply(num));
      this.drawLine(
        ctx,
        scale,
        levelOffset,
        vector4.add(cogOffset),
        vector4.add(vector.multiply(2)).add(cogOffset),
        color ?? ropeLightColor,
      );
      this.drawLine(
        ctx,
        scale,
        levelOffset,
        vector5.add(cogOffset),
        vector5.subtract(vector.multiply(2)).add(cogOffset),
        color ?? ropeLightColor,
      );
    }
    this.drawNodeCog(ctx, xOffset, yOffset, scale, cogOffset, color !== null);
  }

  async draw(
    ctx: CanvasRenderingContext2D,
    xOffset: number,
    yOffset: number,
    scale: number,
    abortController: AbortController,
  ) {
    this.drawCogs(ctx, xOffset, yOffset, scale, new Vector2(0, 1), 'black');
    this.drawCogs(ctx, xOffset, yOffset, scale, new Vector2(0, 0));

    return Result.success();
  }
}

export default class ZipMover extends Entity {
  declare width: number;
  declare height: number;

  theme: Theme;
  innerCogCount: number;

  renderedTexture: HTMLCanvasElement | 'pending' | undefined;

  private ninePatch: NinePatch;

  constructor(entity: any) {
    super(entity, {depth: -9999, noPath: true});

    this.theme = entity.theme ?? 'Normal';
    this.innerCogCount = this.getInnerCogCount(this.theme);

    this.ninePatch = new NinePatch(
      this.width / CelesteMap.tileMultiplier,
      this.height / CelesteMap.tileMultiplier,
      getRealPath(blockPath, this.theme),
    );
  }

  getInnerCogCount(theme: Theme) {
    switch (theme) {
      case 'Normal':
        return 12;
      case 'Moon':
        return 7;
    }
  }

  async loadSprites() {
    await Sprite.add({
      path: getRealPath(lightPath, this.theme),
    });

    for (let i = 0; i < this.innerCogCount; i++) {
      await Sprite.add({
        path: `${getRealPath(innerCogPath, this.theme)}${addLeadingZeroes(i, 2)}`,
      });
    }

    const fullImage = await Sprite.loadImage(
      getRealPath(blockPath, this.theme),
    );

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
    return `${getRealPath(blockPath, this.theme)}:${x},${y}`;
  }

  private mod(x: number, m: number) {
    return ((x % m) + m) % m;
  }

  private async createCanvas(
    abortController: AbortController,
  ): Promise<Result<HTMLCanvasElement>> {
    const canvas = document.createElement('canvas');
    canvas.width = this.width + 2;
    canvas.height = this.height + 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('ctx was undefined');
      return Result.failure(new Error('ctx was undefined'));
    }

    ctx.imageSmoothingEnabled = false;

    const moonOffset = this.theme === 'Moon' ? 2 : 0;

    ctx.fillStyle = 'black';
    ctx.fillRect(
      moonOffset,
      moonOffset,
      this.width + 2 - moonOffset * 2,
      this.height + 2 - moonOffset * 2,
    );

    let num = 1;
    let num2 = 0;
    for (let i = 4; i <= this.height - 4; i += 8) {
      const num3 = num;
      for (let j = 4; j <= this.width - 4; j += 8) {
        const index = Math.floor(
          this.mod(num2 / (Math.PI / 2), 1) * this.innerCogCount,
        );
        const mTexture = Sprite.getImage(
          `${getRealPath(innerCogPath, this.theme)}${addLeadingZeroes(index, 2)}`,
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
        drawImageBrightness(
          ctx,
          mTexture,
          new Vector2(
            j + zero.x - mTexture.width / 2 + drawOffset.x + 1,
            i + zero.y - mTexture.height / 2 + drawOffset.y + 1,
          ),
          1,
          num < 0 ? 0.5 : 1,
        );
        num = -num;
        num2 += Math.PI / 3;
      }
      if (num3 == num) {
        num = -num;
      }
    }

    this.ninePatch.draw(ctx, new Vector2(1, 1));

    const lightImage = Sprite.getImage(getRealPath(lightPath, this.theme));

    const imageScale = new Vector2(lightImage.width, lightImage.height);

    ctx.drawImage(
      lightImage,
      this.width / 2 - imageScale.x / 2 + 1,
      1,
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
        (this.x - 1) * scale + xOffset,
        (this.y - 1) * scale + yOffset,
        canvas.width * scale,
        canvas.height * scale,
      );
    } catch (ex) {
      const err = ex as Error;
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
