import Result from '../../utils/result.js';
import {CelesteMap} from '../mapTypes/celesteMap.js';
import {Entity} from '../mapTypes/entities/entity.js';
import {Level} from '../mapTypes/level.js';
import {TileMatrix} from '../mapTypes/tileMatrix.js';
import {Bounds} from '../utils/bounds.js';
import {clampNormalize, plateauingSineEase} from '../../utils/math.js';
import {Vector2} from '../utils/vector2.js';
import {Tileset} from './tileset.js';

export default class RoomRenderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  renderedRooms: Map<string, HTMLCanvasElement | 'pending'> = new Map();

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.canvas = canvas;
  }

  async drawLevel(
    level: Level,
    bounds: Bounds,
    position: Vector2,
    scale: number,
    abortController: AbortController,
  ) {
    const ctx = this.ctx;

    const levelX = (level.x - bounds.left) * scale - position.x;
    const levelY = (level.y - bounds.top) * scale - position.y;

    const drawScaleCulledResult = await this.drawScaleCulled(
      level,
      levelX,
      levelY,
      scale,
      abortController,
    );
    if (drawScaleCulledResult.isFailure) {
      return Result.failure(drawScaleCulledResult.failure);
    }

    ctx.strokeStyle = 'rgb(113,65,101)';
    ctx.lineWidth = 3;
    ctx.strokeRect(levelX, levelY, level.width * scale, level.height * scale);

    this.drawRoomLabel(level.name, levelX, levelY, scale);

    return Result.success();
  }

  async drawScaleCulled(
    level: Level,
    levelX: number,
    levelY: number,
    scale: number,
    abortController: AbortController,
  ) {
    const levelWidth = level.width * scale;
    const levelHeight = level.height * scale;

    if (levelWidth < 5 || levelHeight < 5) {
      return Result.success();
    }

    const ctx = this.ctx;
    ctx.fillStyle = 'rgb(41, 20, 36)';
    ctx.fillRect(levelX, levelY, level.width * scale, level.height * scale);

    const promises = [];
    for (const actor of level.actors) {
      promises.push(actor.draw(ctx, levelX, levelY, scale, abortController));
      if (abortController.signal.aborted) {
        return Result.failure(abortController.signal.reason);
      }
    }
    try {
      await Promise.all(promises);
      return Result.success();
    } catch (ex) {
      const err = ex as Error;
      return Result.failure(err);
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
        const imageElement = await tileset.getImage(tile);

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
  ): Promise<Result<HTMLCanvasElement | 'pending'>> {
    if (this.renderedRooms.has(level.name)) {
      return Result.success(this.renderedRooms.get(level.name));
    }

    this.createRoomCanvas(tiles, abortController).then(result => {
      if (result.isFailure) {
        this.renderedRooms.delete(level.name);
      }
      const canvas = result.success;
      this.renderedRooms.set(level.name, canvas);
    });
    this.renderedRooms.set(level.name, 'pending');
    return Result.success('pending');
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
    if (canvas === 'pending') {
      return Result.success();
    }

    const ctx = this.ctx;

    try {
      ctx.fillStyle = 'rgb(41, 20, 36)';
      ctx.fillRect(xOffset, yOffset, level.width * scale, level.height * scale);

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

  async drawEntities(
    entities: Entity[],
    scale: number,
    xOffset: number,
    yOffset: number,
    abortController: AbortController,
  ) {
    const ctx = this.ctx;
    for (const entity of entities) {
      if (abortController.signal.aborted) {
        return Result.failure(abortController.signal.reason);
      }
      await entity.draw(ctx, xOffset, yOffset, scale, abortController);
    }

    return Result.success();
  }

  drawRoomLabel(
    label: string,
    xOffset: number,
    yOffset: number,
    scale: number,
  ) {
    const ctx = this.ctx;
    let fontSize = 15 * scale;

    const boundingRect = this.canvas.getBoundingClientRect();

    const normalized = clampNormalize(
      fontSize / boundingRect.width,
      0.004,
      0.03,
    );

    const opacity = plateauingSineEase(normalized, 0.07, 0.4);

    if (opacity <= 0.000001) {
      return;
    }

    fontSize = Math.min(fontSize, 35);

    const size = fontSize / 20;

    ctx.font = `${fontSize}px serif`;
    const textSize = ctx.measureText(label).width;
    ctx.fillStyle = `rgb(0 0 0 / ${40 * opacity}%)`;
    ctx.fillRect(
      10 * scale + xOffset,
      10 * scale + yOffset,
      textSize + 15 * size,
      fontSize + 10 * size,
    );

    ctx.fillStyle = `rgb(255 255 255 / ${100 * opacity}%)`;
    ctx.fillText(label, fontSize + xOffset, fontSize + 10 * scale + yOffset);
  }
}
