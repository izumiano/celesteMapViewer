import {MapBinReader} from '../data/mapBinReader.js';
import {MapRenderer} from './rendering/mapRenderer.js';
import {Camera} from './rendering/camera.js';
import {ModZipReader} from '../data/modZipReader.js';
import {MapZipData} from '../data/modZipData.js';

const canvasContainer = document.getElementById('canvasContainer')!;
const header = document.getElementById('header')!;
const mapList = <HTMLSelectElement>document.getElementById('mapList');
const mapListPlaceholder = document.getElementById('mapListPlaceholder')!;

async function showMap(mapZipData: MapZipData, modZipReader: ModZipReader) {
  const mapData = await modZipReader.readMap(mapZipData);

  const map = await new MapBinReader().decodeData(mapData);
  console.log(map);

  header.innerText = map.package;

  const bounds = map.calculateBounds();
  const camera = new Camera(canvasContainer, bounds);
  const mapRenderer = new MapRenderer(map, bounds, camera);
  mapRenderer.start();
}

async function run() {
  const modZipReader = new ModZipReader("../testData/Monika's D-Sides.zip");
  const modZipData = await modZipReader.readMod();

  for (const map of modZipData.maps) {
    const option = document.createElement('option');
    option.innerText = map.name;
    option.value = map.name;
    mapList.appendChild(option);
  }
  mapList.selectedIndex = 0;

  mapList.onchange = _ => {
    mapListPlaceholder.hidden = false;

    const mapZipData = modZipData.maps[mapList.selectedIndex - 1];

    if (!mapZipData) {
      mapListPlaceholder.hidden = true;
      throw new Error(
        `Could not find ${mapList.options[mapList.selectedIndex - 1].value} in zip`,
      );
    }

    showMap(mapZipData, modZipReader);
  };
}

run();
