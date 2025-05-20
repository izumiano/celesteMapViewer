import {Vector2} from './vector2';

export class Bounds {
  topLeft: Vector2;
  bottomRight: Vector2;

  width: number;
  height: number;

  get left() {
    return this.topLeft.x;
  }

  get right() {
    return this.bottomRight.x;
  }

  get top() {
    return this.topLeft.y;
  }

  get bottom() {
    return this.bottomRight.y;
  }

  constructor(topLeft: Vector2, bottomRight: Vector2) {
    this.topLeft = topLeft;
    this.bottomRight = bottomRight;
    this.width = this.left - this.right;
    this.height = this.bottom - this.top;
  }
}
