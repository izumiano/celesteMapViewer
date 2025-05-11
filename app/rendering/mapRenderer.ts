import {CelesteMap} from '../mapTypes/celesteMap.js';
import {Level} from '../mapTypes/level.js';
import {TileMatrix} from '../mapTypes/tileMatrix.js';

const scale = 0.5 * 2 ** -2;
const tileMultiplier = 8;
const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const header = document.getElementById('header')!;

export class MapRenderer {
  map: CelesteMap;
  ctx: CanvasRenderingContext2D;

  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;

  constructor(map: CelesteMap) {
    this.map = map;
    [this.minWidth, this.maxWidth, this.minHeight, this.maxHeight] =
      this.calculateBounds();
    canvas.width = this.maxWidth - this.minWidth;
    canvas.height = this.maxHeight - this.minHeight;
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
      throw new Error('ctx was null');
    }

    this.ctx = ctx;
  }

  draw() {
    header.innerText = this.map.package;

    for (const level of this.map.levels) {
      this.drawLevel(level);
    }

    // this.drawLevel(this.map.levels[2]); // 91
  }

  calculateBounds() {
    let maxWidth = 0;
    let minWidth = 0;
    let maxHeight = 0;
    let minHeight = 0;
    for (const level of this.map.levels) {
      const tiles = level.solids;
      if (!tiles) {
        console.error('Tiles was undefined');
        continue;
      }

      maxWidth = Math.max(
        maxWidth,
        level.x * scale + tiles.width * scale * tileMultiplier,
      );
      minWidth = Math.min(minWidth, level.x * scale);
      maxHeight = Math.max(
        maxHeight,
        level.y * scale + tiles.height * scale * tileMultiplier,
      );
      minHeight = Math.min(minHeight, level.y * scale);
    }

    return [minWidth, maxWidth, minHeight, maxHeight + 100]; // TODO: why is the max height slighlt wrong
  }

  drawLevel(level: Level) {
    const tiles = level.solids;
    if (!tiles) {
      console.error('Tiles was undefined');
      return;
    }

    this.drawSolids(
      tiles,
      level.x * scale - this.minWidth,
      level.y * scale - this.minHeight,
    );

    this.drawRoomLabel(
      level.name,
      level.x * scale - this.minWidth,
      level.y * scale - this.minHeight,
    );
  }

  drawSolids(tiles: TileMatrix, xOffset: number, yOffset: number) {
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgb(0 0 0)';
    for (let y = 0; y < tiles.height; y++) {
      for (let x = 0; x < tiles.width; x++) {
        if (tiles.get(x, y) < 1) {
          continue;
        }
        ctx.strokeRect(
          x * scale * tileMultiplier + xOffset,
          y * scale * tileMultiplier + yOffset,
          scale * tileMultiplier,
          scale * tileMultiplier,
        );
      }
    }
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
