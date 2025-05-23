import {MapBinReader} from './data/mapBinReader.js';
import {MapRenderer} from './map/rendering/mapRenderer.js';
import {Camera} from './map/rendering/camera.js';
import {ModZipReader} from './data/modZipReader.js';
import {MapZipData} from './data/modZipData.js';
import ModDownloader from './utils/modDownloader.js';

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

  readMod(files[0].arrayBuffer());
};

const files = modUploadInput.files;
if (files && files.length > 0) {
  readMod(files[0].arrayBuffer());
}

gbLinkInput.onkeydown = event => {
  if (event.key !== 'Enter') {
    return;
  }

  const modDownloader = new ModDownloader();

  modDownloader.download(gbLinkInput.value).then(async mod => {
    await readMod(mod);
    modUploadInput.value = '';
  });
};

async function showMap(mapZipData: MapZipData, modZipReader: ModZipReader) {
  const mapData = await modZipReader.readMap(mapZipData);

  const map = await new MapBinReader().decodeData(mapData);
  console.log(map);

  header.innerText = map.package;

  const bounds = map.calculateBounds();
  const camera = new Camera(canvasContainer, map, bounds);
  const mapRenderer = new MapRenderer(map, bounds, camera);
  mapRenderer.start();
}

async function readMod(
  modData: Promise<Response> | Response | Promise<ArrayBuffer> | ArrayBuffer,
) {
  console.debug('reading mod');
  try {
    const modZipReader = new ModZipReader();
    const awaitedModData = await modData;
    if (awaitedModData instanceof Response && !awaitedModData.ok) {
      const message = `Error: ${awaitedModData.status} - ${awaitedModData.statusText}`;
      throw new Error(message);
    }
    const modZipData = await modZipReader.readMod(awaitedModData);

    mapList.innerHTML = originalMapListContent;

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
  } catch (ex) {
    console.error(ex);
  }
}
