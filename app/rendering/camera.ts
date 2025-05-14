import {Bounds} from '../utils/bounds.js';
import {Vector2} from '../utils/vector2.js';

type OnMoveFunc = (position: Vector2) => void;

export class Camera {
  position = new Vector2(0, 0);
  mapBounds: Vector2;
  size: Vector2;

  #element: HTMLElement;
  #onClickData: ClickData[] = [];

  #marginSize = 20;
  #borderSize = 10; // size of the css border on canvasContainer
  #sizeOffset = this.#marginSize + this.#borderSize;

  constructor(element: HTMLElement, bounds: Bounds, size: Vector2) {
    this.#element = element;
    this.mapBounds = new Vector2(bounds.width, bounds.height);
    size.x -= this.#borderSize;
    size.y -= this.#borderSize;
    this.size = size;
  }

  #moveTo(xPos: number, yPos: number, onMove: OnMoveFunc) {
    const clickData = this.#onClickData[0];

    const elementPosition = clickData.elementPosition;
    const mousePosition = clickData.mousePosition;
    let x = elementPosition.x + xPos - mousePosition.x;
    let y = elementPosition.y + yPos - mousePosition.y;

    const boundingRect = this.#element.getBoundingClientRect();
    x = Math.max(this.mapBounds.x + boundingRect.width - this.#sizeOffset, x);
    x = Math.min(this.#marginSize, x);
    y = Math.max(-this.mapBounds.y + boundingRect.height - this.#sizeOffset, y);
    y = Math.min(this.#marginSize, y);

    this.position.x = x;
    this.position.y = y;
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

      this.#moveTo(event.clientX, event.clientY, onMove);
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

        this.#moveTo(changedTouch.clientX, changedTouch.clientY, onMove);
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
