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
