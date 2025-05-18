import {MapBinReader} from './data/mapBinReader.js';
import {MapRenderer} from './rendering/mapRenderer.js';
import {Camera} from './rendering/camera.js';

const canvasContainer = document.getElementById('canvasContainer')!;
const header = document.getElementById('header')!;

async function run() {
  const map = await new MapBinReader().decodeFile('../testData/0-Prologue.bin');
  // const map = await new MapBinReader().decodeFile(
  //   '../testData/1-ForsakenCity.bin',
  // );
  // const map = await new MapBinReader().decodeFile(
  //   '../testData/6-ReflectionD-B.bin',
  // );
  console.log(map);

  header.innerText = map.package;

  const bounds = map.calculateBounds();
  const camera = new Camera(canvasContainer, bounds);
  const mapRenderer = new MapRenderer(map, bounds, camera);
  mapRenderer.start();
}

run();
