export class Vector2 {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static Create(vec: Vector2) {
    return new Vector2(vec.x, vec.y);
  }

  distance(vec: Vector2) {
    return Math.hypot(this.x - vec.x, this.y - vec.y);
  }
}
