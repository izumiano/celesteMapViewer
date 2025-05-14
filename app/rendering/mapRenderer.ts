import {CelesteMap} from '../mapTypes/celesteMap.js';
import {Level} from '../mapTypes/level.js';
import {TileMatrix} from '../mapTypes/tileMatrix.js';
import {Bounds} from '../utils/bounds.js';
import {Vector2} from '../utils/vector2.js';
import {Camera} from './camera.js';

const canvas = <HTMLCanvasElement>document.getElementById('canvas');

export class MapRenderer {
  scale = 2 ** 0;
  map: CelesteMap;
  ctx: CanvasRenderingContext2D;

  bounds: Bounds;
  camera: Camera;

  constructor(map: CelesteMap, bounds: Bounds, camera: Camera) {
    this.map = map;
    this.bounds = bounds;
    this.camera = camera;
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
      throw new Error('ctx was null');
    }

    camera.start(position => {
      this.draw(position);
    });
    onresize = _ => {
      camera.updateSize();
      this.draw(camera.position);
    };

    this.ctx = ctx;
  }

  levelIsInView(level: Level) {
    const left =
      level.x * this.scale - this.bounds.left + this.camera.position.x;
    const right =
      (level.x + level.width) * this.scale -
      this.bounds.left +
      this.camera.position.x;
    const top = level.y * this.scale - this.bounds.top + this.camera.position.y;
    const bottom =
      (level.y + level.height) * this.scale -
      this.bounds.top +
      this.camera.position.y;
    return (
      left < this.camera.size.x &&
      right > 0 &&
      top < this.camera.size.y &&
      bottom > 0
    );
  }

  draw(position: Vector2) {
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const level of this.map.levels) {
      this.drawLevel(level, position);
    }
  }

  drawLevel(level: Level, position: Vector2) {
    const tiles = level.solids;
    if (!tiles) {
      console.error('Tiles was undefined');
      return;
    }
    if (!this.levelIsInView(level)) {
      return;
    }

    const ctx = this.ctx;

    const levelX = level.x * this.scale - this.bounds.left + position.x;
    const levelY = level.y * this.scale - this.bounds.top + position.y;

    ctx.strokeStyle = 'rgb(0 0 0 / 40%)';
    ctx.strokeRect(levelX, levelY, level.width, level.height);

    this.drawSolids(tiles, levelX, levelY);

    this.drawRoomLabel(level.name, levelX, levelY);
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
          x * this.scale * CelesteMap.tileMultiplier + xOffset,
          y * this.scale * CelesteMap.tileMultiplier + yOffset,
          this.scale * CelesteMap.tileMultiplier,
          this.scale * CelesteMap.tileMultiplier,
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
