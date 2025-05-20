import {Vector2} from '../utils/vector2.js';
import {Camera, OnMoveFunc} from './camera.js';

export class InputHandler {
  element: HTMLElement;
  camera: Camera;
  onMove: OnMoveFunc;

  onInputData: InputData[] = [];

  constructor(element: HTMLElement, camera: Camera, onMove: OnMoveFunc) {
    this.element = element;
    this.camera = camera;
    this.onMove = onMove;
  }

  onInputStart(event: Event, position: Vector2) {
    event.preventDefault();
    this.onInputData.push(
      new InputData(
        Vector2.Create(position),
        Vector2.Create(this.camera.position),
        this.camera.scale,
      ),
    );
  }

  onInputEnd(event: Event) {
    event.preventDefault();
    this.onInputData.pop();
  }

  onInputMove(event: Event, position: Vector2) {
    event.preventDefault();

    const cameraPosition = this.onInputData[0].cameraPosition;
    const inputPosition = this.onInputData[0].inputPosition;
    const newPosition = new Vector2(
      cameraPosition.x - position.x + inputPosition.x,
      cameraPosition.y - position.y + inputPosition.y,
    );

    this.onInputData[0].currentPosition = position;

    this.camera.moveTo(newPosition, this.onMove);
  }

  start() {}
}

export class MouseHandler extends InputHandler {
  start() {
    this.element.onmousedown = event => {
      if (event.button == 1 || event.buttons == 4) {
        this.onInputStart(event, new Vector2(event.clientX, event.clientY));
      }
    };

    onmouseup = event => {
      if (event.button == 1 || event.buttons == 4) {
        this.onInputEnd(event);
      }
    };

    onmousemove = event => {
      if (this.onInputData.length < 1) {
        return;
      }

      this.onInputMove(event, new Vector2(event.clientX, event.clientY));
    };
  }
}

export class TouchHandler extends InputHandler {
  onInputStart(event: TouchEvent): void {
    this.onInputData = [];

    for (const touch of event.touches) {
      super.onInputStart(event, new Vector2(touch.clientX, touch.clientY));
    }

    this.camera.moveTo(this.camera.position, this.onMove);
  }

  onInputEnd(event: TouchEvent): void {
    super.onInputEnd(event);

    this.onInputStart(event);
  }

  start() {
    this.element.ontouchstart = event => {
      this.onInputStart(event);
    };
    ontouchend = event => {
      this.onInputEnd(event);
    };
    ontouchcancel = event => {
      this.onInputEnd(event);
    };
    ontouchmove = event => {
      if (this.onInputData.length < 1) {
        return;
      }
      event.preventDefault();

      if (event.touches.length < 2) {
        const touch = event.touches[0];
        this.onInputMove(event, new Vector2(touch.clientX, touch.clientY));
        return;
      }

      const touch1 = this.onInputData[0];
      const touch2 = this.onInputData[1];

      touch1.currentPosition = new Vector2(
        event.touches[0].clientX,
        event.touches[0].clientY,
      );
      touch2.currentPosition = new Vector2(
        event.touches[1].clientX,
        event.touches[1].clientY,
      );

      const boundingRect = this.element.getBoundingClientRect();

      const origDist = touch1.inputPosition.distance(touch2.inputPosition);
      const dist = touch1.currentPosition.distance(touch2.currentPosition);

      const newScale = touch1.scale * (dist / origDist);

      const touch1Pos = new Vector2(
        touch1.currentPosition.x - boundingRect.x,
        touch1.currentPosition.y - boundingRect.y,
      );
      const touch2Pos = new Vector2(
        touch2.currentPosition.x - boundingRect.x,
        touch2.currentPosition.y - boundingRect.y,
      );
      const origTouch1Pos = new Vector2(
        touch1.inputPosition.x - boundingRect.x,
        touch1.inputPosition.y - boundingRect.y,
      );
      const origTouch2Pos = new Vector2(
        touch2.inputPosition.x - boundingRect.x,
        touch2.inputPosition.y - boundingRect.y,
      );
      const mid = new Vector2(
        touch1Pos.x + (touch2Pos.x - touch1Pos.x) / 2,
        touch1Pos.y + (touch2Pos.y - touch1Pos.y) / 2,
      );
      const origMid = new Vector2(
        origTouch1Pos.x + (origTouch2Pos.x - origTouch1Pos.x) / 2,
        origTouch1Pos.y + (origTouch2Pos.y - origTouch1Pos.y) / 2,
      );

      let newPosition = new Vector2(
        touch1.cameraPosition.x + (origMid.x - mid.x),
        touch1.cameraPosition.y + (origMid.y - mid.y),
      );
      const midS = new Vector2(
        (mid.x + newPosition.x) / newScale,
        (mid.y + newPosition.y) / newScale,
      );
      const origMidS = new Vector2(
        (origMid.x + touch1.cameraPosition.x) / touch1.scale,
        (origMid.y + touch1.cameraPosition.y) / touch1.scale,
      );
      const diff = new Vector2(midS.x - origMidS.x, midS.y - origMidS.y);

      newPosition.x -= diff.x * newScale;
      newPosition.y -= diff.y * newScale;

      this.camera.scale = newScale;
      this.camera.moveTo(newPosition, this.onMove);
    };
  }
}

class InputData {
  inputPosition: Vector2;
  cameraPosition: Vector2;
  scale: number;
  currentPosition: Vector2;

  constructor(inputPosition: Vector2, cameraPosition: Vector2, scale: number) {
    this.inputPosition = inputPosition;
    this.cameraPosition = cameraPosition;
    this.scale = scale;
    this.currentPosition = inputPosition;
  }
}
