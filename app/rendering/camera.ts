import {Bounds} from '../utils/bounds.js';
import {Vector2} from '../utils/vector2.js';

const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const canvasContainer = document.getElementById('canvasContainer')!;

type OnMoveFunc = (position: Vector2) => void;

export class Camera {
  position = new Vector2(0, 0);
  mapBounds: Vector2;
  size = new Vector2(0, 0);

  #element: HTMLElement;
  #onClickData: ClickData[] = [];

  #marginSize = 20;
  #borderSize = 10; // size of the css border on canvasContainer
  #sizeOffset = this.#marginSize + this.#borderSize;

  constructor(element: HTMLElement, bounds: Bounds) {
    this.#element = element;
    this.mapBounds = new Vector2(bounds.width, bounds.height);

    this.updateSize();
  }

  updateSize() {
    const boundingRect = canvasContainer.getBoundingClientRect();
    canvas.width = boundingRect.width;
    canvas.height = boundingRect.height;

    this.size = new Vector2(
      boundingRect.width - this.#borderSize,
      boundingRect.height - this.#borderSize,
    );

    this.position = this.#getClampedPosition(this.position.x, this.position.y);
  }

  #getClampedPosition(x: number, y: number) {
    const boundingRect = this.#element.getBoundingClientRect();
    x = Math.max(this.mapBounds.x + boundingRect.width - this.#sizeOffset, x);
    x = Math.min(this.#marginSize, x);
    y = Math.max(-this.mapBounds.y + boundingRect.height - this.#sizeOffset, y);
    y = Math.min(this.#marginSize, y);

    return new Vector2(x, y);
  }

  #moveTo(position: Vector2, onMove: OnMoveFunc) {
    const clickData = this.#onClickData[0];

    const elementPosition = clickData.elementPosition;
    const mousePosition = clickData.mousePosition;
    const x = elementPosition.x + position.x - mousePosition.x;
    const y = elementPosition.y + position.y - mousePosition.y;

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
