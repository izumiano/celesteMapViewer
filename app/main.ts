import {MapBinReader} from './mapBinReader.js';
import {MapRenderer} from './rendering/mapRenderer.js';
import {Camera} from './rendering/camera.js';
import {Vector2} from './utils/vector2.js';

const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const canvasContainer = document.getElementById('canvasContainer')!;
const header = document.getElementById('header')!;

async function run() {
  // const map = await new MapBinReader().decodeFile('../testData/0-Prologue.bin');
  // const map = await new MapBinReader().decodeFile(
  //   '../testData/1-ForsakenCity.bin',
  // );
  const map = await new MapBinReader().decodeFile(
    '../testData/6-ReflectionD-B.bin',
  );
  console.log(map);

  header.innerText = map.package;

  const boundingRect = canvasContainer.getBoundingClientRect();
  canvas.width = boundingRect.width;
  canvas.height = boundingRect.height;

  const bounds = map.calculateBounds();
  const camera = new Camera(
    canvasContainer,
    bounds,
    new Vector2(boundingRect.width, boundingRect.height),
  );
  const mapRenderer = new MapRenderer(map, bounds, camera);

  mapRenderer.draw(new Vector2(0, 0));
}

run();
