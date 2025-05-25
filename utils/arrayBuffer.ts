export function toArrayBuffer(arrayBufferLike: ArrayBufferLike) {
  if (arrayBufferLike instanceof ArrayBuffer) {
    return arrayBufferLike;
  } else if (arrayBufferLike instanceof SharedArrayBuffer) {
    // Create a new ArrayBuffer with the same content
    const newBuffer = new ArrayBuffer(arrayBufferLike.byteLength);
    const tmp = new Uint8Array(newBuffer);
    tmp.set(new Uint8Array(arrayBufferLike));
    return newBuffer;
  } else {
    throw new Error(
      'The provided value is not an ArrayBuffer or SharedArrayBuffer.',
    );
  }
}
