import {Bounds} from '../utils/bounds.js';
import {Vector2} from '../utils/vector2.js';

const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const canvasContainer = document.getElementById('canvasContainer')!;

type OnMoveFunc = (position: Vector2) => void;
type OnResizeFunc = () => void;

export class Camera {
  position = new Vector2(-Camera.marginSize, -Camera.marginSize);
  mapBounds: Vector2;
  size = new Vector2(0, 0);
  scale = 1;

  onResize: OnResizeFunc | null = null;

  #element: HTMLElement;
  #onClickData: ClickData[] = [];

  static marginSize = 20;
  static borderSize = 10; // size of the css border on canvasContainer
  static sizeOffset = this.marginSize + this.borderSize;

  constructor(element: HTMLElement, bounds: Bounds) {
    this.#element = element;
    this.mapBounds = new Vector2(bounds.width, bounds.height);

    this.updateSize();

    canvasContainer.onwheel = event => {
      const dir = Math.sign(event.deltaY);
      const prevScale = this.scale;
      this.scale -= dir / 15;

      const prevMidX = this.position.x + this.size.x / 2;
      const prevMidY = this.position.y + this.size.y / 2;

      this.position.x +=
        ((this.position.x + this.size.x / 2) / prevScale) * this.scale -
        prevMidX;
      this.position.y +=
        ((this.position.y + this.size.y / 2) / prevScale) * this.scale -
        prevMidY;

      this.position = this.#getClampedPosition(
        this.position.x,
        this.position.y,
      );

      this.onResize && this.onResize();
    };
  }

  updateSize() {
    const boundingRect = canvasContainer.getBoundingClientRect();
    canvas.width = boundingRect.width;
    canvas.height = boundingRect.height;

    this.size = new Vector2(
      boundingRect.width - Camera.borderSize,
      boundingRect.height - Camera.borderSize,
    );

    this.position = this.#getClampedPosition(this.position.x, this.position.y);
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

  #moveTo(position: Vector2, onMove: OnMoveFunc) {
    const clickData = this.#onClickData[0];

    const elementPosition = clickData.elementPosition;
    const mousePosition = clickData.mousePosition;
    const x = elementPosition.x - position.x + mousePosition.x;
    const y = elementPosition.y - position.y + mousePosition.y;

    this.position = this.#getClampedPosition(x, y);

    onMove(this.position);
  }

  #onClickStart(x: number, y: number) {
    this.#onClickData.push(
      new ClickData(new Vector2(x, y), Vector2.Create(this.position)),
    );
  }

  start(onMove: OnMoveFunc) {
    this.#element.onmousedown = event => {
      if (event.button == 1 || event.buttons == 4) {
        event.preventDefault();
        this.#onClickStart(event.clientX, event.clientY);
      }
    };

    onmouseup = event => {
      if (event.button == 1 || event.buttons == 4) {
        event.preventDefault();
        this.#onClickData.pop();
      }
    };

    onmousemove = event => {
      if (this.#onClickData.length <= 0) {
        return;
      }
      event.preventDefault();

      this.#moveTo(new Vector2(event.clientX, event.clientY), onMove);
    };

    if (typeof this.#element.ontouchstart !== 'undefined') {
      this.#element.ontouchstart = event => {
        event.preventDefault();

        this.#onClickStart(
          event.changedTouches[0].clientX,
          event.changedTouches[0].clientY,
        );
      };

      ontouchend = event => {
        event.preventDefault();
        this.#onClickData.pop();
      };

      ontouchcancel = event => {
        event.preventDefault();
        this.#onClickData.pop();
      };

      ontouchmove = event => {
        if (!this.#onClickData) {
          return;
        }
        event.preventDefault();

        const changedTouch = event.changedTouches[0];

        this.#moveTo(
          new Vector2(changedTouch.clientX, changedTouch.clientY),
          onMove,
        );
      };
    }
  }
}

class ClickData {
  mousePosition: Vector2;
  elementPosition: Vector2;

  constructor(mousePosition: Vector2, elementPosition: Vector2) {
    this.mousePosition = mousePosition;
    this.elementPosition = elementPosition;
  }
}
