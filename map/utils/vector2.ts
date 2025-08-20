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

  safeNormalize() {
    if (this.isZero()) {
      return new Vector2(0, 0);
    }
    const val = 1 / Math.sqrt(this.x * this.x + this.y * this.y);
    const x = this.x * val;
    const y = this.y * val;
    return new Vector2(x, y);
  }

  isZero() {
    return this.x === 0 && this.y === 0;
  }

  perpendicular() {
    return new Vector2(0 - this.y, this.x);
  }

  multiply(num: number) {
    return new Vector2(this.x * num, this.y * num);
  }

  add(other: Vector2) {
    return new Vector2(this.x + other.x, this.y + other.y);
  }

  subtract(other: Vector2) {
    return new Vector2(this.x - other.x, this.y - other.y);
  }

  magnitude() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}
