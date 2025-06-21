import {CelesteMap} from '../mapTypes/celesteMap.js';
import {Level} from '../mapTypes/level.js';
import {Bounds} from '../utils/bounds.js';
import {Vector2} from '../utils/vector2.js';
import {InputHandler, MouseHandler, TouchHandler} from './inputHandler.js';

const canvas = <HTMLCanvasElement>document.getElementById('canvas');

export type OnMoveFunc = (position: Vector2) => void;
export type OnResizeFunc = () => void;

export class Camera {
  static marginSize = 20;
  static borderSize = 5; // size of the css border on canvasContainer
  static sizeOffset = this.marginSize + this.borderSize * 2;

  position = new Vector2(-Camera.marginSize, -Camera.marginSize);
  mapBounds: Bounds;
  size = new Vector2(0, 0);
  scale = 1;

  onResize: OnResizeFunc | null = null;

  #element: HTMLElement;

  #inputHandlers: InputHandler[] = [];

  get touchHandler(): TouchHandler | null {
    for (const handler of this.#inputHandlers) {
      if (handler instanceof TouchHandler) {
        return handler;
      }
    }

    return null;
  }

  constructor(element: HTMLElement, map: CelesteMap) {
    this.#element = element;
    this.mapBounds = map.bounds;

    this.updateSize();

    document.onmousedown = event => {
      if (event.button !== 0) {
        return;
      }

      const boundingRect = canvas.getBoundingClientRect();
      const mousePos = new Vector2(
        event.x - boundingRect.x,
        event.y - boundingRect.y,
      );

      const tile = map.getTileAt(
        this.worldSpaceToTileGrid(this.screenSpaceToWorld(mousePos)),
      );
      tile?.adjacents?.log();
    };
    this.centerLevel(map.getStartLevel());
  }

  updateSize() {
    const boundingRect = this.#element.getBoundingClientRect();
    canvas.width = boundingRect.width;
    canvas.height = boundingRect.height;

    this.size = new Vector2(
      boundingRect.width - Camera.borderSize * 2,
      boundingRect.height - Camera.borderSize * 2,
    );

    this.position = this.#getClampedPosition(this.position.x, this.position.y);
  }

  /**
   *
   * @param newScale
   * @param zoomPoint The point in screen-space to zoom in on
   */
  setScale(newScale: number, zoomPoint: Vector2) {
    const prevScale = this.scale;
    this.scale = newScale;

    const globalZoomPoint = new Vector2(
      this.position.x + zoomPoint.x,
      this.position.y + zoomPoint.y,
    );

    this.position.x +=
      (globalZoomPoint.x / prevScale) * this.scale - globalZoomPoint.x;
    this.position.y +=
      (globalZoomPoint.y / prevScale) * this.scale - globalZoomPoint.y;

    this.moveTo(this.position);

    this.onResize && this.onResize();
  }

  centerLevel(level: Level | null) {
    if (!level) {
      console.error('Cannot center level that is null');
      return;
    }

    const newPos = new Vector2(
      level.x + level.width / 2 - this.size.x / 2 - this.mapBounds.left,
      level.y + level.height / 2 - this.size.y / 2 - this.mapBounds.top,
    );

    const widthScale =
      this.size.x / (level.width + Camera.marginSize / this.scale);
    const heightScale =
      this.size.y / (level.height + Camera.marginSize / this.scale);

    this.position = newPos;
    this.setScale(
      Math.min(widthScale, heightScale),
      new Vector2(this.size.x / 2, this.size.y / 2),
    );
    this.moveTo(newPos);
  }

  #getClampedPosition(x: number, y: number) {
    const boundingRect = this.#element.getBoundingClientRect();
    x = Math.min(
      -this.mapBounds.width * this.scale -
        boundingRect.width +
        Camera.sizeOffset,
      x,
    );
    x = Math.max(-Camera.marginSize, x);
    y = Math.min(
      this.mapBounds.height * this.scale -
        boundingRect.height +
        Camera.sizeOffset,
      y,
    );
    y = Math.max(-Camera.marginSize, y);

    return new Vector2(x, y);
  }

  worldSpaceToTileGrid(worldPos: Vector2) {
    const gridPos = new Vector2(
      Math.floor(worldPos.x / CelesteMap.tileMultiplier),
      Math.floor(worldPos.y / CelesteMap.tileMultiplier),
    );

    return gridPos;
  }

  worldSpaceToCameraGrid(worldPos: Vector2) {
    const gridPos = this.worldSpaceToTileGrid(worldPos);

    return new Vector2(
      gridPos.x * CelesteMap.tileMultiplier * this.scale - this.position.x,
      gridPos.y * CelesteMap.tileMultiplier * this.scale - this.position.y,
    );
  }

  screenSpaceToWorld(screenPos: Vector2) {
    return new Vector2(
      (this.position.x + screenPos.x) / this.scale,
      (this.position.y + screenPos.y) / this.scale,
    );
  }

  moveTo(position: Vector2, onMove: OnMoveFunc | null = null) {
    this.position = this.#getClampedPosition(position.x, position.y);

    onMove && onMove(this.position);
  }

  start(onMove: OnMoveFunc) {
    if (typeof ontouchstart !== 'undefined') {
      this.#inputHandlers.push(new TouchHandler(this.#element, this, onMove));
    }
    if (typeof onmousedown !== 'undefined') {
      this.#inputHandlers.push(new MouseHandler(this.#element, this, onMove));
    }

    this.#inputHandlers.forEach(handler => {
      handler.start();
    });
  }

  dispose() {
    this.onResize = null;

    this.#inputHandlers.forEach(handler => {
      handler.dispose();
    });
  }
}
