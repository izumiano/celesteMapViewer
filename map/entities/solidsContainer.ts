import Result from '../../utils/result.js';
import {TileInfo, Tileset} from '../rendering/tileset.js';
import {CelesteMap} from '../mapTypes/celesteMap.js';
import {Level} from '../mapTypes/level.js';
import {TileMatrix} from '../mapTypes/tileMatrix.js';
import Actor from './actor.js';

export default class SolidsContainer extends Actor {
  level: Level;
  tiles: TileMatrix;

  renderedTexture: HTMLCanvasElement | 'pending' | undefined;

  constructor(level: Level, tiles: TileMatrix, depth: number = -10000) {
    super(depth);
    this.level = level;
    this.tiles = tiles;
  }

  async loadSprites() {
    for (let y = 0; y < this.tiles.height; y++) {
      for (let x = 0; x < this.tiles.width; x++) {
        const tile = this.tiles.get(x, y);
        if (!tile?.isSolid()) {
          continue;
        }

        const tileset = await Tileset.lazyGet(tile);
        const {tilesetMatch, tilesetCoordinates} = await tileset.addImage(tile);
        tile.tilesetMatch = tilesetMatch;
        tile.tilesetCoordinates = tilesetCoordinates;
      }
    }
  }

  async createRoomCanvas(
    tiles: TileMatrix,
    abortController: AbortController,
  ): Promise<Result<HTMLCanvasElement>> {
    const canvas = document.createElement('canvas');
    canvas.width = tiles.width * CelesteMap.tileMultiplier;
    canvas.height = tiles.height * CelesteMap.tileMultiplier;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('ctx was undefined');
      return Result.failure(new Error('ctx was undefined'));
    }

    ctx.imageSmoothingEnabled = false;
    ctx.strokeStyle = 'rgb(200 200 200)';
    for (let y = 0; y < tiles.height; y++) {
      for (let x = 0; x < tiles.width; x++) {
        const tile = tiles.get(x, y);
        if (!tile?.isSolid()) {
          continue;
        }

        const tileset = await Tileset.lazyGet(tile);
        const imageElement = tileset.getImage(tile);

        ctx.drawImage(
          imageElement,
          x * CelesteMap.tileMultiplier,
          y * CelesteMap.tileMultiplier,
          CelesteMap.tileMultiplier,
          CelesteMap.tileMultiplier,
        );

        if (abortController.signal.aborted) {
          return Result.failure(new Error(abortController.signal.reason));
        }
      }
    }

    return Result.success(canvas);
  }

  getSolidsCanvas(
    tiles: TileMatrix,
    abortController: AbortController,
  ): Result<HTMLCanvasElement | 'pending'> {
    if (this.renderedTexture) {
      return Result.success(this.renderedTexture);
    }

    this.createRoomCanvas(tiles, abortController).then(result => {
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
    const canvasResult = this.getSolidsCanvas(this.tiles, abortController);
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
        xOffset,
        yOffset,
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
