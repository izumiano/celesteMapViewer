import {MapBinReader} from './data/mapBinReader.js';
import {MapRenderer} from './rendering/mapRenderer.js';
import {Camera} from './rendering/camera.js';
import {ModZipReader} from './data/modZipReader.js';

const canvasContainer = document.getElementById('canvasContainer')!;
const header = document.getElementById('header')!;

async function run() {
  const modZipReader = new ModZipReader("../testData/Monika's D-Sides.zip");
  const modZipData = await modZipReader.readMod();

  const mapZipData = modZipData.maps[0];
  const mapData = await modZipReader.readMap(mapZipData);

  const map = await new MapBinReader().decodeData(mapData);
  console.log(map);

  header.innerText = map.package;

  const bounds = map.calculateBounds();
  const camera = new Camera(canvasContainer, bounds);
  const mapRenderer = new MapRenderer(map, bounds, camera);
  mapRenderer.start();
}

run();
