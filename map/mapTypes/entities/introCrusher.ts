import Result from '../../../utils/result.js';
import {Tileset} from '../../rendering/tileset.js';
import {CelesteMap} from '../celesteMap.js';
import {Tile, TileMatrix} from '../tileMatrix.js';
import {Entity} from './entity.js';
import SolidsContainer from './solidsContainer.js';

export default class IntroCrusher extends SolidsContainer {
  declare width: number;
  declare height: number;

  x: number;
  y: number;

  constructor(entity: any) {
    const width = entity.width;
    const height = entity.height;

    const matrix = [];
    const tileWidth = width / CelesteMap.tileMultiplier;
    const tileHeight = height / CelesteMap.tileMultiplier;
    const length = tileWidth * tileHeight;
    for (let i = 0; i < length; i++) {
      matrix.push(new Tile((entity.tiletype ?? '3').charCodeAt(0)));
    }
    const tiles = new TileMatrix(
      matrix,
      tileWidth,
      tileHeight,
      tileWidth,
      tileHeight,
    );
    tiles.autoTile();

    super(entity, tiles, 0);

    this.x = entity.x;
    this.y = entity.y;
  }

  async draw(
    ctx: CanvasRenderingContext2D,
    xOffset: number,
    yOffset: number,
    scale: number,
    abortController: AbortController,
  ) {
    super.draw(
      ctx,
      xOffset + this.x * scale,
      yOffset + this.y * scale,
      scale,
      abortController,
    );

    return Result.success();
  }
}
