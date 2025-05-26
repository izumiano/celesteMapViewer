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
      tiles,
      scale,
      levelX,
      levelY,
      abortController,
    );
    if (drawSolidsResult.isFailure) {
      return Result.failure(drawSolidsResult.failure);
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

  async drawSolids(
    tiles: TileMatrix,
    scale: number,
    xOffset: number,
    yOffset: number,
    abortController: AbortController,
  ) {
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgb(200 200 200)';
    const tileScale = scale * CelesteMap.tileMultiplier;
    for (let y = 0; y < tiles.height; y++) {
      for (let x = 0; x < tiles.width; x++) {
        const tileId = tiles.get(x, y);
        if (tileId < 1) {
          continue;
        }

        const xPosition = x * tileScale + xOffset;
        const yPosition = y * tileScale + yOffset;

        const tileset = await Tileset.getFromId(tileId);
        const imageElement = await tileset.get(x);

        ctx.drawImage(imageElement, xPosition, yPosition, tileScale, tileScale);

        if (abortController.signal.aborted) {
          return Result.failure(new Error(abortController.signal.reason));
        }
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
