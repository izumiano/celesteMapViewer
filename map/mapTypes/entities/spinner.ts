import {getRandomInt} from '../../../utils/math.js';
import Result from '../../../utils/result.js';
import {Vector2} from '../../utils/vector2.js';
import {Entity} from './entity.js';

type SpinnerColor = 'blue' | 'core' | 'purple' | 'rainbow' | 'red';
type SpinnerTextures = 'blue' | 'red' | 'purple' | 'white';

const imageDir = window.location + 'assets/spinners/';
const textureMappings: Map<SpinnerColor, SpinnerTextures> = new Map([
  ['blue', 'blue'],
  ['core', 'red'],
  ['purple', 'purple'],
  ['rainbow', 'white'],
  ['red', 'red'],
]);

export default class Spinner extends Entity {
  static images: Map<string, HTMLImageElement> = new Map();

  color: SpinnerColor;
  spinnerTextureIndex: number;

  constructor(entity: any) {
    super(entity, -8500);
    this.color = entity.color?.toLowerCase() ?? 'blue';
    this.spinnerTextureIndex = getRandomInt(0, 3, entity.id);
  }

  static async #getImage(path: string) {
    if (this.images.has(path)) {
      return this.images.get(path)!;
    }

    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = () => {
        resolve(null);
      };
      image.onerror = () => {
        reject('Failed loading image');
      };
      image.src = imageDir + path;
    });
    this.images.set(path, image);
    return image;
  }

  static async getImage(color: SpinnerColor, textureIndex: number) {
    const path = `crystal/fg_${textureMappings.get(color)}0${textureIndex}}.png`;
    if (this.images.has(path)) {
      return this.images.get(path)!;
    }

    let image = new Image();
    try {
      image = await this.#getImage(path);
    } catch (ex) {
      console.warn(ex);
      image = await this.#getImage('crystal/fg_blue00.png');
    }
    this.images.set(path, image);
    return image;
  }

  async draw(
    ctx: CanvasRenderingContext2D,
    xOffset: number,
    yOffset: number,
    scale: number,
    abortController: AbortController,
  ) {
    const image = await Spinner.getImage(this.color, this.spinnerTextureIndex);
    const imageScale = new Vector2(image.width * scale, image.height * scale);

    ctx.drawImage(
      image,
      this.x * scale + xOffset - imageScale.x / 2,
      this.y * scale + yOffset - imageScale.y / 2,
      imageScale.x,
      imageScale.y,
    );

    return Result.success();
  }
}
