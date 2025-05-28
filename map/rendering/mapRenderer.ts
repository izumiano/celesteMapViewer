import {CelesteMap} from '../mapTypes/celesteMap.js';
import {Level} from '../mapTypes/level.js';
import {Bounds} from '../utils/bounds.js';
import {Vector2} from '../utils/vector2.js';
import {Camera} from './camera.js';
import RoomRenderer from './roomRenderer.js';

const canvas = <HTMLCanvasElement>document.getElementById('canvas');

export class MapRenderer {
  #scale: number;
  map: CelesteMap;
  ctx: CanvasRenderingContext2D;

  bounds: Bounds;
  camera: Camera;

  roomRenderer: RoomRenderer;

  #abortController = new AbortController();

  constructor(map: CelesteMap, camera: Camera) {
    this.map = map;
    this.bounds = map.bounds;
    this.camera = camera;
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
      throw new Error('ctx was null');
    }

    this.roomRenderer = new RoomRenderer(canvas, ctx);

    ctx.imageSmoothingEnabled = false;
    this.ctx = ctx;

    this.#scale = camera.scale;
  }

  start() {
    this.camera.start(async position => {
      await this.draw(position);
    });
    this.camera.onResize = async () => {
      await this.draw(this.camera.position);
    };
    onresize = async _ => {
      this.camera.updateSize();
      await this.draw(this.camera.position);
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

  async draw(position: Vector2) {
    this.#abortController.abort('Rerender');
    this.#abortController = new AbortController();

    this.#scale = this.camera.scale;

    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    await this.#drawRooms(position);

    this.drawDebug();
  }

  async #drawRooms(position: Vector2) {
    const promises = [];
    for (const level of this.map.levels.values()) {
      if (!this.levelIsInView(level)) {
        continue;
      }

      promises.push(
        new Promise(async (resolve, reject) => {
          const drawLevelResult = await this.roomRenderer.drawLevel(
            level,
            this.bounds,
            position,
            this.#scale,
            this.#abortController,
          );
          if (drawLevelResult.isFailure) {
            if (drawLevelResult.failure.message === 'Rerender') {
              resolve(null);
            }
            reject(drawLevelResult.failure);
          }
          resolve(null);
        }),
      );
    }

    await Promise.all(promises);
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

  // drawMouseDebug() {
  //   const ctx = this.ctx;

  //   const gridPos = this.camera.worldSpaceToCameraGrid(
  //     this.camera.screenSpaceToWorld(this.#mousePos),
  //   );
  //   ctx.strokeRect(
  //     gridPos.x,
  //     gridPos.y,
  //     CelesteMap.tileMultiplier * this.#scale,
  //     CelesteMap.tileMultiplier * this.#scale,
  //   );
  // }

  drawDebug() {
    const ctx = this.ctx;
    //
    ctx.font = `15px serif`;
    ctx.fillStyle = 'white';

    // this.drawTouchDebug();

    // this.drawMouseDebug();

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
}
