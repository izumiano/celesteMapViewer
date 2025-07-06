const imageDir = window.location + 'assets/';

export default class Sprite {
  static #images: Map<string, HTMLImageElement | ImageBitmap> = new Map();

  static async #loadImage(path: string) {
    if (this.#images.has(path)) {
      // console.error(path, 'already exists');
      return this.#images.get(path)!;
    }

    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = () => {
        resolve(null);
      };
      image.onerror = () => {
        reject(`Failed loading image at ${imageDir + path}`);
      };
      image.src = imageDir + path + '.png';
    });
    return image;
  }

  static async add(spriteData: SpriteData) {
    let path: string | undefined = spriteData.path;
    path ??= spriteData.defaultPath;
    if (!path) {
      throw new Error('path undefined');
    }

    if (this.#images.has(path)) {
      // console.error(spriteData.path, 'already exists');
      return this.#images.get(path)!;
    }

    let image: ImageBitmap | HTMLImageElement | undefined = spriteData.image;
    if (!image) {
      try {
        image = await this.#loadImage(path);
      } catch (ex) {
        console.warn(ex);
        if (spriteData.defaultPath) {
          image = await this.#loadImage(spriteData.defaultPath);
        }
      }
    }
    if (image) {
      this.#images.set(path, image);
    }
    return image;
  }

  static getImage(path: string) {
    return this.#images.get(path)!;
  }

  static has(path: string) {
    return this.#images.has(path);
  }
}

interface SpriteData {
  path: string;
  defaultPath?: string | undefined;
  image?: ImageBitmap | undefined;
}
