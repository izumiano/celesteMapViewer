export function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

export function clampNormalize(val: number, min: number, max: number) {
  return (clamp(val, min, max) - min) / (max - min);
}

/**
 *
 * @param val
 * @param l the leftmost point where we want it clamped to 1
 * @param r the rightmost point where we want it clamped to 1
 */
export function plateauingSineEase(val: number, l: number, r: number) {
  if (val < l) {
    return Math.sin((val * Math.PI) / (2 * l));
  } else if (val > r) {
    return Math.sin(((val + 1 - 2 * r) * Math.PI) / (2 - 2 * r));
  } else {
    return 1;
  }
}

export function getRandomInt(
  min: number,
  max: number,
  seed: number | null = null,
) {
  if (seed) {
    return new SeededRNG(seed).nextInt(min, max);
  }
  return Math.floor(Math.random() * (max - min + 1) + min);
}

class SeededRNG {
  state: number;

  constructor(seed: number) {
    this.state = Math.abs(Math.floor(seed));
  }

  next() {
    const a = 1103515245;
    const c = 12345;
    const m = Math.pow(2, 31);

    this.state = (a * this.state + c) % m;
    return this.state / m;
  }

  nextInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}
