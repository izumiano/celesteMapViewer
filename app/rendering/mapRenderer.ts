import {CelesteMap} from '../mapTypes/celesteMap.js';
import {Level} from '../mapTypes/level.js';
import {TileMatrix} from '../mapTypes/tileMatrix.js';

const scale = 8 * 3;
const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const header = document.getElementById('header')!;

export class MapRenderer {
  map: CelesteMap;
  ctx: CanvasRenderingContext2D;

  constructor(map: CelesteMap) {
    this.map = map;
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
      throw new Error('ctx was null');
    }

    this.ctx = ctx;
  }

  draw() {
    header.innerText = this.map.package;

    this.drawLevel(this.map.levels[2]); // 91
  }

  drawLevel(level: Level) {
    const tiles = level.solids;
    if (!tiles) {
      console.error('Tiles was undefined');
      return;
    }

    canvas.width = tiles.width * scale;
    canvas.height = tiles.height * scale;

    this.drawSolids(tiles);

    this.drawRoomLabel(level.name);
  }

  drawSolids(tiles: TileMatrix) {
    const ctx = this.ctx;
    for (let y = 0; y < tiles.height; y++) {
      for (let x = 0; x < tiles.width; x++) {
        if (tiles.get(x, y) < 1) {
          continue;
        }
        ctx.strokeStyle = 'rgb(0 0 0)';
        ctx.strokeRect(x * scale, y * scale, scale, scale);
      }
    }
  }

  drawRoomLabel(label: string) {
    const ctx = this.ctx;
    const fontSize = 38;
    ctx.font = `${fontSize}px serif`;
    const textSize = ctx.measureText(label).width;

    ctx.fillStyle = 'rgb(0 0 0 / 40%)';
    ctx.fillRect(10, 10, textSize + 15, fontSize + 10);

    ctx.fillStyle = 'white';
    ctx.fillText(label, 20, fontSize + 7);
  }
}
