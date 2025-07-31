import {getRandomInt} from '../../../utils/math.js';
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
    const color = entity.color?.toLowerCase() ?? 'blue';
    const spinnerTextureIndex = getRandomInt(0, 3, entity.id);
    super(entity, {
      depth: -8500,
      path: `spinners/crystal/fg_${textureMappings.get(color)}0${spinnerTextureIndex}`,
      defaultPath: 'spinners/crystal/fg_blue00.png',
    });

    this.color = color;
    this.spinnerTextureIndex = spinnerTextureIndex;
  }
}
