import {Vector2} from '../utils/vector2.js';

type OnMoveFunc = (x: number, y: number) => void;
type GetPositionFunc = () => Vector2;

export class Camera {
  position = new Vector2(0, 0);
  size: Vector2;

  #element: HTMLElement;
  #getPositionFunc: GetPositionFunc;
  #onMoveFunc: OnMoveFunc;
  #onClickData: ClickData[] = [];

  constructor(
    element: HTMLElement,
    width: number,
    height: number,
    getPosition: GetPositionFunc,
    onMove: OnMoveFunc,
  ) {
    this.#element = element;
    this.size = new Vector2(width, height);
    this.#getPositionFunc = getPosition;
    this.#onMoveFunc = onMove;
  }

  #moveTo(xPos: number, yPos: number) {
    const clickData = this.#onClickData[0];

    const elementPosition = clickData.elementPosition;
    const mousePosition = clickData.mousePosition;
    let x = elementPosition.x + xPos - mousePosition.x;
    let y = elementPosition.y + yPos - mousePosition.y;

    const marginSize = 20;
    const borderSize = 10; // size of the css border on canvasContainer
    const sizeOffset = marginSize + borderSize;
    const boundingRect = this.#element.getBoundingClientRect();
    x = Math.max(this.size.x + boundingRect.width - sizeOffset, x);
    x = Math.min(marginSize, x);
    y = Math.max(-this.size.y + boundingRect.height - sizeOffset, y);
    y = Math.min(marginSize, y);

    console.log(x);

    this.#onMoveFunc(x, y);
  }

  #onClickStart(x: number, y: number) {
    this.#onClickData.push(
      new ClickData(new Vector2(x, y), Vector2.Create(this.#getPositionFunc())),
    );
  }

  start() {
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

      this.#moveTo(event.clientX, event.clientY);
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

        this.#moveTo(changedTouch.clientX, changedTouch.clientY);
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
