import {getRandomInt} from '../../../utils/math.js';
import Result from '../../../utils/result.js';
import Sprite from '../../rendering/sprite.js';
import {Vector2} from '../../utils/vector2.js';
import {Entity} from './entity.js';

type SpinnerColor = 'blue' | 'core' | 'purple' | 'rainbow' | 'red';
type SpinnerTextures = 'blue' | 'red' | 'purple' | 'white';

const textureMappings: Map<SpinnerColor, SpinnerTextures> = new Map([
  ['blue', 'blue'],
  ['core', 'red'],
  ['purple', 'purple'],
  ['rainbow', 'white'],
  ['red', 'red'],
]);

export default class Spinner extends Entity {
  color: SpinnerColor;
  spinnerTextureIndex: number;

  get path() {
    return `spinners/crystal/fg_${textureMappings.get(this.color)}0${this.spinnerTextureIndex}`;
  }

  constructor(entity: any) {
    super(entity, -8500);
    this.color = entity.color?.toLowerCase() ?? 'blue';
    this.spinnerTextureIndex = getRandomInt(0, 3, entity.id);

    Sprite.add({
      path: this.path,
      defaultPath: 'spinners/crystal/fg_blue00.png',
    });
  }

  async draw(
    ctx: CanvasRenderingContext2D,
    xOffset: number,
    yOffset: number,
    scale: number,
    abortController: AbortController,
  ) {
    const image = Sprite.getImage(this.path);
    if (!image) {
      console.error(this.path);
    }
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
