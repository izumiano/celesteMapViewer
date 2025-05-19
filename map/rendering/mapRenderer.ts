import {CelesteMap} from '../mapTypes/celesteMap.js';
import {Level} from '../mapTypes/level.js';
import {TileMatrix} from '../mapTypes/tileMatrix.js';
import {Bounds} from '../utils/bounds.js';
import {Vector2} from '../utils/vector2.js';
import {Camera} from './camera.js';

const canvas = <HTMLCanvasElement>document.getElementById('canvas');

export class MapRenderer {
  #scale: number;
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

    this.ctx = ctx;

    this.#scale = camera.scale;
  }

  start() {
    this.camera.start(position => {
      this.draw(position);
    });
    this.camera.onResize = () => {
      this.draw(this.camera.position);
    };
    onresize = _ => {
      this.camera.updateSize();
      this.draw(this.camera.position);
    };

    this.draw(this.camera.position);
  }

  levelIsInView(level: Level) {
    const left =
      (level.x - this.bounds.left) * this.#scale - this.camera.position.x;
    if (left > this.camera.size.x) {
      return false;
    }
    const right =
      (level.x + level.width - this.bounds.left) * this.#scale -
      this.camera.position.x;
    if (right < 0) {
      return false;
    }
    const top =
      (level.y - this.bounds.top) * this.#scale - this.camera.position.y;
    if (top > this.camera.size.y) {
      return false;
    }
    const bottom =
      (level.y + level.height - this.bounds.top) * this.#scale -
      this.camera.position.y;
    if (bottom < 0) {
      return false;
    }
    return true;
  }

  draw(position: Vector2) {
    this.#scale = this.camera.scale;

    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const level of this.map.levels) {
      this.drawLevel(level, position);
    }

    // this.drawDebug();
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

    const levelX = (level.x - this.bounds.left) * this.#scale - position.x;
    const levelY = (level.y - this.bounds.top) * this.#scale - position.y;

    ctx.strokeStyle = 'rgb(0 0 0 / 40%)';
    ctx.strokeRect(
      levelX,
      levelY,
      level.width * this.#scale,
      level.height * this.#scale,
    );

    this.drawSolids(tiles, levelX, levelY);

    this.drawRoomLabel(level.name, levelX, levelY);
  }

  drawTouchDebug() {
    const touchHandler = this.camera.touchHandler;
    if (!touchHandler) {
      return;
    }
    if (touchHandler.onInputData.length < 2) {
      return;
    }

    const ctx = this.ctx;

    const boundingRect = touchHandler.element.getBoundingClientRect();

    const touch1 = touchHandler.onInputData[0];
    const touch2 = touchHandler.onInputData[1];
    const touch1Pos = new Vector2(
      touch1.currentPosition.x - boundingRect.x,
      touch1.currentPosition.y - boundingRect.y,
    );
    const touch2Pos = new Vector2(
      touch2.currentPosition.x - boundingRect.x,
      touch2.currentPosition.y - boundingRect.y,
    );
    const mid = new Vector2(
      touch1Pos.x + (touch2Pos.x - touch1Pos.x) / 2,
      touch1Pos.y + (touch2Pos.y - touch1Pos.y) / 2,
    );

    ctx.beginPath();
    ctx.moveTo(touch1Pos.x, touch1Pos.y);
    ctx.lineTo(touch2Pos.x, touch2Pos.y);
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(touch1Pos.x, touch1Pos.y, 50, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(touch2Pos.x, touch2Pos.y, 50, 0, Math.PI * 2, true);
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.arc(mid.x, mid.y, 10, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.closePath();
  }

  drawDebug() {
    const ctx = this.ctx;
    //
    ctx.font = `15px serif`;
    ctx.fillStyle = 'black';

    this.drawTouchDebug();

    // Top
    ctx.strokeRect(this.camera.size.x / 2, 0, 0, 20);
    ctx.fillText(
      (
        (this.camera.position.x + this.camera.size.x / 2) /
        this.#scale
      ).toString(),
      this.camera.size.x / 2,
      30,
    );

    // Bottom
    // ctx.strokeRect(
    //   this.camera.size.x / 2,
    //   this.camera.size.y - Camera.marginSize - 10,
    //   0,
    //   10,
    // );
    // ctx.fillText(
    //   (this.camera.size.x / 2).toString(),
    //   this.camera.size.x / 2,
    //   this.camera.size.y - Camera.marginSize - 10,
    // );

    // Moving;
    ctx.strokeRect(
      -this.camera.position.x + (this.camera.size.x / 2) * this.#scale,
      0,
      0,
      10,
    );
    ctx.fillText(
      //
      (this.camera.size.x / 2).toString(),
      -this.camera.position.x + (this.camera.size.x / 2) * this.#scale,
      20,
    );
  }

  drawSolids(tiles: TileMatrix, xOffset: number, yOffset: number) {
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgb(200 200 200)';
    for (let y = 0; y < tiles.height; y++) {
      for (let x = 0; x < tiles.width; x++) {
        if (tiles.get(x, y) < 1) {
          continue;
        }
        ctx.strokeRect(
          x * this.#scale * CelesteMap.tileMultiplier + xOffset,
          y * this.#scale * CelesteMap.tileMultiplier + yOffset,
          this.#scale * CelesteMap.tileMultiplier,
          this.#scale * CelesteMap.tileMultiplier,
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
