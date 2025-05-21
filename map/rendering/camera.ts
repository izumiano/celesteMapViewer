import {Bounds} from '../utils/bounds.js';
import {Vector2} from '../utils/vector2.js';
import {InputHandler, MouseHandler, TouchHandler} from './inputHandler.js';

const canvas = <HTMLCanvasElement>document.getElementById('canvas');

export type OnMoveFunc = (position: Vector2) => void;
export type OnResizeFunc = () => void;

export class Camera {
  position = new Vector2(-Camera.marginSize, -Camera.marginSize);
  mapBounds: Vector2;
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

  static marginSize = 20;
  static borderSize = 5; // size of the css border on canvasContainer
  static sizeOffset = this.marginSize + this.borderSize * 2;

  constructor(element: HTMLElement, bounds: Bounds) {
    this.#element = element;
    this.mapBounds = new Vector2(bounds.width, bounds.height);

    this.updateSize();
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

    // this.position = this.#getClampedPosition(this.position.x, this.position.y);
    this.moveTo(this.position);

    this.onResize && this.onResize();
  }

  #getClampedPosition(x: number, y: number) {
    const boundingRect = this.#element.getBoundingClientRect();
    x = Math.min(
      -this.mapBounds.x * this.scale - boundingRect.width + Camera.sizeOffset,
      x,
    );
    x = Math.max(-Camera.marginSize, x);
    y = Math.min(
      this.mapBounds.y * this.scale - boundingRect.height + Camera.sizeOffset,
      y,
    );
    y = Math.max(-Camera.marginSize, y);

    return new Vector2(x, y);
  }

  moveTo(position: Vector2, onMove: OnMoveFunc | null = null) {
    this.position = this.#getClampedPosition(position.x, position.y);

    onMove && onMove(this.position);
  }

  start(onMove: OnMoveFunc) {
    this.#element.onwheel = event => {
      const boundingRect = this.#element.getBoundingClientRect();
      const mousePosition = new Vector2(
        event.clientX - boundingRect.x - Camera.borderSize,
        event.clientY - boundingRect.y - Camera.borderSize,
      );

      const dir = Math.sign(event.deltaY);

      this.setScale(this.scale * 1.1 ** -dir, mousePosition);
    };

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
}
