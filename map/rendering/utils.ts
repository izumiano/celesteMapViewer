import {Vector2} from '../utils/vector2.js';

export function drawImageBrightness(
  ctx: CanvasRenderingContext2D,
  image: HTMLCanvasElement | HTMLImageElement | ImageBitmap,
  position: Vector2,
  scale: number,
  brightness: number,
) {
  const drawImage = (
    image: HTMLCanvasElement | HTMLImageElement | ImageBitmap,
  ) => {
    ctx.drawImage(
      image,
      position.x,
      position.y,
      image.width * scale,
      image.height * scale,
    );
  };

  if (!ctx.filter) {
    if (brightness < 1) {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('ctx was undefined');
        return;
      }

      ctx.imageSmoothingEnabled = false;

      ctx.drawImage(image, 0, 0, image.width, image.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      for (let i = 0; i < pixels.length; i += 4) {
        pixels[i] = pixels[i] * brightness; // Red
        pixels[i + 1] = pixels[i + 1] * brightness; // Green
        pixels[i + 2] = pixels[i + 2] * brightness; // Blue
      }

      ctx.putImageData(imageData, 0, 0);
      image = canvas;
    }
    drawImage(image);
    return;
  }

  ctx.filter = `brightness(${brightness * 100}%)`;
  drawImage(image);
  ctx.filter = 'brightness(100%)';
}
