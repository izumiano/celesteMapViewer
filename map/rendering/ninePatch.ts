import {CelesteMap} from '../mapTypes/celesteMap.js';
import {Vector2} from '../utils/vector2.js';
import Sprite from './sprite.js';

export default class NinePatch {
  private tileWidth: number;
  private tileHeight: number;
  private spritePath: string;

  constructor(tileWidth: number, tileHeight: number, spritePath: string) {
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.spritePath = spritePath;
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

    return `${this.spritePath}:${spriteX},${spriteY}`;
  }

  draw(ctx: CanvasRenderingContext2D, offset: Vector2) {
    for (let yW = 0; yW < this.tileHeight; yW++) {
      for (let xW = 0; xW < this.tileWidth; xW++) {
        const image = Sprite.getImage(this.getPathFromRealCoordsAt(xW, yW));

        const imageScale = new Vector2(image.width, image.height);

        ctx.drawImage(
          image,
          xW * CelesteMap.tileMultiplier + offset.x,
          yW * CelesteMap.tileMultiplier + offset.y,
          imageScale.x,
          imageScale.y,
        );
      }
    }
  }
}
