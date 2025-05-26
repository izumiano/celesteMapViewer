import Result from '../../utils/result.js';
import {CelesteMap} from '../mapTypes/celesteMap.js';
import {Entity} from '../mapTypes/entities/entity.js';
import Spinner from '../mapTypes/entities/spinner.js';
import {Level} from '../mapTypes/level.js';
import {TileMatrix} from '../mapTypes/tileMatrix.js';
import {Bounds} from '../utils/bounds.js';
import {Vector2} from '../utils/vector2.js';
import {Tileset} from './tileset.js';

export default class RoomRenderer {
  ctx: CanvasRenderingContext2D;

  renderedRooms: Map<string, HTMLCanvasElement> = new Map();

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  async drawLevel(
    level: Level,
    bounds: Bounds,
    position: Vector2,
    scale: number,
    abortController: AbortController,
  ) {
    const tiles = level.solids;
    if (!tiles) {
      console.error('Tiles was undefined');
      return Result.success();
    }

    const ctx = this.ctx;

    const levelX = (level.x - bounds.left) * scale - position.x;
    const levelY = (level.y - bounds.top) * scale - position.y;

    ctx.strokeStyle = 'rgb(0 0 0 / 40%)';
    ctx.strokeRect(levelX, levelY, level.width * scale, level.height * scale);

    const drawSolidsResult = await this.drawSolids(
      level,
      tiles,
      scale,
      levelX,
      levelY,
      abortController,
    );
    if (drawSolidsResult.isFailure) {
      return drawSolidsResult.failure;
    }
    const drawEntitiesResult = this.drawEntities(
      level.entities,
      scale,
      levelX,
      levelY,
      abortController,
    );
    if (drawEntitiesResult.isFailure) {
      return Result.failure(drawEntitiesResult.failure);
    }

    this.drawRoomLabel(level.name, levelX, levelY);

    return Result.success();
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

    ctx.strokeStyle = 'rgb(200 200 200)';
    for (let y = 0; y < tiles.height; y++) {
      for (let x = 0; x < tiles.width; x++) {
        const tileId = tiles.get(x, y);
        if (tileId < 1) {
          continue;
        }

        const tileset = await Tileset.getFromId(tileId);
        const imageElement = await tileset.get(x);

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

  async getRoomCanvas(
    level: Level,
    tiles: TileMatrix,
    abortController: AbortController,
  ): Promise<Result<HTMLCanvasElement>> {
    if (this.renderedRooms.has(level.name)) {
      return Result.success(this.renderedRooms.get(level.name));
    }

    const canvasResult = await this.createRoomCanvas(tiles, abortController);
    if (canvasResult.isFailure) {
      return Result.failure(canvasResult.failure);
    }
    const canvas = canvasResult.success;

    this.renderedRooms.set(level.name, canvas);
    return Result.success(canvas);
  }

  async drawSolids(
    level: Level,
    tiles: TileMatrix,
    scale: number,
    xOffset: number,
    yOffset: number,
    abortController: AbortController,
  ) {
    const canvasResult = await this.getRoomCanvas(
      level,
      tiles,
      abortController,
    );
    if (canvasResult.isFailure) {
      return Result.failure(canvasResult.failure);
    }
    const canvas = canvasResult.success;

    try {
      this.ctx.drawImage(
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

  drawEntities(
    entities: Entity[],
    scale: number,
    xOffset: number,
    yOffset: number,
    abortController: AbortController,
  ) {
    const ctx = this.ctx;
    ctx.strokeStyle = 'white';
    for (const entity of entities) {
      if (entity instanceof Spinner) {
        ctx.beginPath();
        ctx.arc(
          entity.x * scale + xOffset,
          entity.y * scale + yOffset,
          CelesteMap.tileMultiplier * scale,
          0,
          Math.PI * 2,
          true,
        );
        ctx.closePath();
        ctx.stroke();
      }

      if (abortController.signal.aborted) {
        return Result.failure(abortController.signal.reason);
      }
    }

    return Result.success();
  }

  drawRoomLabel(label: string, xOffset: number, yOffset: number) {
    const ctx = this.ctx;
    const fontSize = 10;
    ctx.font = `${fontSize}px serif`;
    const textSize = ctx.measureText(label).width;

    ctx.fillStyle = 'rgb(0 0 0 / 40%)';
    ctx.fillRect(10 + xOffset, 10 + yOffset, textSize + 15, fontSize + 10);

    ctx.fillStyle = 'white';
    ctx.fillText(label, 20 + xOffset, fontSize + 7 + yOffset);
  }
}
