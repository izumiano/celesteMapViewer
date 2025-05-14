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
}
