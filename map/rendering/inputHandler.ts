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

  dispose() {}
}

export class MouseHandler extends InputHandler {
  touchPadDetector = new TouchPadDetector();

  onMouseDown(event: MouseEvent) {
    if (event.button == 1 || event.buttons == 4) {
      this.onInputStart(event, new Vector2(event.clientX, event.clientY));
    }
  }

  onMouseUp(event: MouseEvent) {
    if (event.button == 1 || event.buttons == 4) {
      this.onInputEnd(event);
    }
  }

  onWheel(event: WheelEvent) {
    event.preventDefault();

    const boundingRect = this.element.getBoundingClientRect();
    const mousePosition = new Vector2(
      event.clientX - boundingRect.x - Camera.borderSize,
      event.clientY - boundingRect.y - Camera.borderSize,
    );

    if (event.ctrlKey) {
      let s = Math.exp(-event.deltaY / 100);

      this.camera.setScale(this.camera.scale * s, mousePosition);
    } else {
      if (this.touchPadDetector.isTrackPad === true) {
        const newPos = Vector2.Create(this.camera.position);
        newPos.x += event.deltaX;
        newPos.y += event.deltaY;
        this.camera.moveTo(newPos, this.onMove);
      } else {
        const dir = Math.sign(event.deltaY);
        this.camera.setScale(this.camera.scale * 1.1 ** -dir, mousePosition);
      }
    }

    for (let i = 0; i < this.onInputData.length; i++) {
      this.onInputData[i] = new InputData(
        new Vector2(event.x, event.y),
        Vector2.Create(this.camera.position),
        this.camera.scale,
      );
    }
  }

  onMouseMove(event: MouseEvent) {
    if (this.onInputData.length < 1) {
      return;
    }

    this.onInputMove(event, new Vector2(event.clientX, event.clientY));
  }

  #wheelFuncRef = this.onWheel.bind(this);
  #mouseDownFuncRef = this.onMouseDown.bind(this);
  #mouseUpFuncRef = this.onMouseUp.bind(this);
  #mouseMoveFuncRef = this.onMouseMove.bind(this);
  start() {
    this.touchPadDetector.start();

    this.element.addEventListener('mousedown', this.#mouseDownFuncRef);
    addEventListener('mouseup', this.#mouseUpFuncRef);
    this.element.addEventListener('wheel', this.#wheelFuncRef, {
      passive: false,
    });
    addEventListener('mousemove', this.#mouseMoveFuncRef);
  }

  dispose() {
    this.element.removeEventListener('mousedown', this.#mouseDownFuncRef);
    removeEventListener('mouseup', this.#mouseUpFuncRef);
    this.element.removeEventListener('wheel', this.#wheelFuncRef);
    removeEventListener('mousemove', this.#mouseMoveFuncRef);

    this.touchPadDetector.dispose();
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

  onTouchMove(event: TouchEvent) {
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
  }

  #touchStartFuncRef = this.onInputStart.bind(this);
  #touchEndFuncRef = this.onInputEnd.bind(this);
  #touchMoveFuncRef = this.onTouchMove.bind(this);
  start() {
    this.element.addEventListener('touchstart', this.#touchStartFuncRef);
    addEventListener('touchend', this.#touchEndFuncRef);
    addEventListener('touchcancel', this.#touchEndFuncRef);
    addEventListener('touchmove', this.#touchMoveFuncRef);
  }

  dispose() {
    this.element.removeEventListener('touchstart', this.#touchStartFuncRef);
    removeEventListener('touchend', this.#touchEndFuncRef);
    removeEventListener('touchcancel', this.#touchEndFuncRef);
    removeEventListener('touchmove', this.#touchMoveFuncRef);
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

class TouchPadDetector {
  oldTime = 0;
  newTime = 0;
  isTrackPad: boolean | undefined;
  eventCount = 0;
  eventCountStart = performance.now();

  resetDetection() {
    this.oldTime = 0;
    this.newTime = 0;
    this.eventCount = 0;
  }

  onWheel(event: MouseEvent) {
    if (event.ctrlKey) {
      this.isTrackPad = true;
      return;
    }

    if (this.eventCount === 0) {
      this.eventCountStart = performance.now();
    }

    this.eventCount++;

    if (
      typeof this.isTrackPad === 'undefined' &&
      performance.now() - this.eventCountStart > 100
    ) {
      if (this.eventCount > 5) {
        this.isTrackPad = true;
      } else {
        this.isTrackPad = false;
      }
      window.setTimeout(() => this.resetDetection(), 2000);
    }
  }

  onMouseDown(event: MouseEvent) {
    if (event.button == 1 || event.buttons == 4) {
      this.isTrackPad = false;
    }
  }

  #wheelFuncRef = this.onWheel.bind(this);
  #mouseDownFuncRef = this.onMouseDown.bind(this);
  start() {
    addEventListener('wheel', this.#wheelFuncRef);
    addEventListener('mousedown', this.#mouseDownFuncRef);
  }

  dispose() {
    removeEventListener('wheel', this.#wheelFuncRef);
    removeEventListener('mousedown', this.#mouseDownFuncRef);
  }
}
