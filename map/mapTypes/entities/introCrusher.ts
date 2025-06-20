import Result from '../../../utils/result.js';
import {Tileset} from '../../rendering/tileset.js';
import {CelesteMap} from '../celesteMap.js';
import {Tile, TileMatrix} from '../tileMatrix.js';
import {Entity} from './entity.js';

export default class IntroCrusher extends Entity {
  tiles: TileMatrix;
  declare width: number;
  declare height: number;

  constructor(entity: any) {
    console.log(entity);
    super(entity);

    const matrix = [];
    const tileWidth = this.width / CelesteMap.tileMultiplier;
    const tileHeight = this.height / CelesteMap.tileMultiplier;
    const length = tileWidth * tileHeight;
    for (let i = 0; i < length; i++) {
      matrix.push(new Tile((entity.tiletype ?? '3').charCodeAt(0)));
    }
    this.tiles = new TileMatrix(
      matrix,
      tileWidth,
      tileHeight,
      tileWidth,
      tileHeight,
    );
    this.tiles.autoTile();
  }

  async draw(
    ctx: CanvasRenderingContext2D,
    xOffset: number,
    yOffset: number,
    scale: number,
    abortController: AbortController,
  ) {
    const canvasResult = await this.getEntityCanvas();
    if (canvasResult.isFailure) {
      return Result.failure(canvasResult.failure);
    }
    ctx.drawImage(
      canvasResult.success,
      this.x * scale + xOffset,
      this.y * scale + yOffset,
      this.width * scale,
      this.height * scale,
    );

    return Result.success();
  }

  async lazyDraw(ctx: CanvasRenderingContext2D) {
    for (let y = 0; y < this.tiles.height; y++) {
      for (let x = 0; x < this.tiles.width; x++) {
        const tile = this.tiles.get(x, y);
        if (!tile) {
          continue;
        }

        const tileset = await Tileset.lazyGet(tile);
        const imageElement = await tileset.getImage(tile);

        ctx.drawImage(
          imageElement,
          x * CelesteMap.tileMultiplier,
          y * CelesteMap.tileMultiplier,
          CelesteMap.tileMultiplier,
          CelesteMap.tileMultiplier,
        );
      }
    }
    return Result.success();
  }
}
