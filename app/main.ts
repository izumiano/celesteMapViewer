import {MapBinReader} from './mapBinReader.js';
import {MapRenderer} from './rendering/mapRenderer.js';
import {Camera} from './rendering/camera.js';
import {Vector2} from './utils/vector2.js';

const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const canvasContainer = document.getElementById('canvasContainer')!;
const header = document.getElementById('header')!;

async function run() {
  // const map = await new MapBinReader().decodeFile('../testData/0-Prologue.bin');
  const map = await new MapBinReader().decodeFile(
    '../testData/1-ForsakenCity.bin',
  );
  // const map = await new MapBinReader().decodeFile(
  //   '../testData/6-ReflectionD-B.bin',
  // );

  header.innerText = map.package;

  let position = new Vector2(0, 0);

  canvas.width = 1920;
  canvas.height = 1080;

  const bounds = map.calculateBounds();
  const mapRenderer = new MapRenderer(map, bounds);

  console.log(map);
  mapRenderer.draw(position);

  new Camera(
    canvasContainer,
    bounds.width,
    bounds.height,
    () => {
      return position;
    },
    (x, y) => {
      position.x = x;
      position.y = y;

      // console.log(position);
      mapRenderer.draw(position);
    },
  ).start();
}

run();
