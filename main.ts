import {MapBinReader} from './data/mapBinReader.js';
import {MapRenderer} from './map/rendering/mapRenderer.js';
import {Camera} from './map/rendering/camera.js';
import ModDownloader from './utils/modDownloader.js';
import {AbstractMapData} from './data/modData.js';
import {ModReader} from './data/modReader.js';

const canvasContainer = document.getElementById('canvasContainer')!;
const header = document.getElementById('header')!;
const mapList = <HTMLSelectElement>document.getElementById('mapList');
const mapListPlaceholder = document.getElementById('mapListPlaceholder')!;
const gbLinkInput = <HTMLInputElement>document.getElementById('gbLinkInput');
const modUploadInput = <HTMLInputElement>document.getElementById('modUpload');

const originalMapListContent = mapList.innerHTML;

modUploadInput.onchange = _ => {
  const files = modUploadInput.files;
  if (!files || files.length <= 0) {
    return;
  }

  readMod(files[0]);
};

const files = modUploadInput.files;
if (files && files.length > 0) {
  readMod(files[0]);
}

gbLinkInput.onkeydown = event => {
  if (event.key !== 'Enter') {
    return;
  }

  const modDownloader = new ModDownloader();

  modDownloader.download(gbLinkInput.value).then(async mod => {
    console.log(mod.headers);
    await readMod(mod);
    modUploadInput.value = '';
  });
};

async function showMap(mapData: AbstractMapData) {
  const mapBuffer = await mapData.readMap();

  const map = await new MapBinReader().decodeData(mapBuffer);
  console.log(map);

  header.innerText = map.package;

  const bounds = map.calculateBounds();
  const camera = new Camera(canvasContainer, map, bounds);
  const mapRenderer = new MapRenderer(map, bounds, camera);
  mapRenderer.start();
}

async function readMod(
  modBinData:
    | Promise<Response>
    | Response
    | Promise<ArrayBuffer>
    | ArrayBuffer
    | File,
) {
  const modDataResult = await new ModReader().read(modBinData);
  if (modDataResult.isFailure) {
    console.error(modDataResult.failure);
    return;
  }
  const modData = modDataResult.success;

  mapList.innerHTML = originalMapListContent;

  for (const map of modData.maps) {
    const option = document.createElement('option');
    option.innerText = map.name;
    option.value = map.name;
    mapList.appendChild(option);
  }
  mapList.selectedIndex = 0;

  mapList.onchange = _ => {
    mapListPlaceholder.hidden = false;

    const mapZipData = modData.maps[mapList.selectedIndex - 1];

    if (!mapZipData) {
      mapListPlaceholder.hidden = true;
      throw new Error(
        `Could not find ${mapList.options[mapList.selectedIndex - 1].value} in zip`,
      );
    }

    showMap(mapZipData);
  };
}
