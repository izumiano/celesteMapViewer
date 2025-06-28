import {MapBinReader} from './data/mapBinReader.js';
import {MapRenderer} from './map/rendering/mapRenderer.js';
import {Camera} from './map/rendering/camera.js';
import ModDownloader from './utils/modDownloader.js';
import ModData, {AbstractMapData} from './data/modData.js';
import {ModReader} from './data/modReader.js';
import Result from './utils/result.js';
import responseProgress, {OnProgress} from './utils/responseProgress.js';
import {toArrayBuffer} from './utils/arrayBuffer.js';
import {TilesetInfo} from './map/rendering/tileset.js';
import {mapLoadingProgress} from './utils/progressTracker.js';

const canvasContainer = document.getElementById('canvasContainer')!;
const header = document.getElementById('header')!;
const mapList = <HTMLSelectElement>document.getElementById('mapList');
const mapListPlaceholder = document.getElementById('mapListPlaceholder')!;
const gbLinkInput = <HTMLInputElement>document.getElementById('gbLinkInput');
const modUploadInput = <HTMLInputElement>document.getElementById('modUpload');
const modUploadFileName = document.getElementById('modUploadFileName')!;
const gbLinkInputProgress = document.getElementById('gbLinkInputProgress')!;

const originalMapListContent = mapList.innerHTML;

const modReader = new ModReader();

modUploadInput.onchange = async _ => {
  const files = modUploadInput.files;
  readLocalMod(files);
};

const files = modUploadInput.files;
readLocalMod(files);

gbLinkInput.oninput = _ => {
  gbLinkInput.setCustomValidity('');
};

gbLinkInput.onkeydown = async event => {
  if (event.key !== 'Enter') {
    return;
  }

  gbLinkInput.setCustomValidity('');

  const readResult = await readModFromUrl(gbLinkInput.value, progress => {
    gbLinkInputProgress.style.setProperty('--progress', progress.toString());
  });
  if (readResult.isFailure) {
    console.error(readResult.failure);
    gbLinkInput.setCustomValidity('ERROR: ' + readResult.failure.message);
  }

  gbLinkInputProgress.style.setProperty('--progress', '0');
};

mapList.onanimationend = event => {
  if (event.animationName === 'pop') {
    mapList.classList.remove('pop');
  }
};

async function readLocalMod(files: FileList | null) {
  if (!files || files.length <= 0) {
    return;
  }

  modUploadInput.setCustomValidity('');
  modUploadFileName.innerText = Array.from(files)
    .map(file => {
      return file.name;
    })
    .reduce((prev, curr) => {
      return prev + ', ' + curr;
    });
  const modResult = await modReader.read(files);
  if (modResult.isFailure) {
    modUploadInput.setCustomValidity('ERROR: ' + modResult.failure.message);
    console.error(modResult.failure);
    return;
  }

  createModList(modResult.success);
}

let mapRenderer: MapRenderer | undefined;
async function showMap(mapData: AbstractMapData) {
  const mapBuffer = await mapData.readMap();

  await TilesetInfo.populate();
  const map = await new MapBinReader().decodeData(mapBuffer);
  mapLoadingProgress.reset();
  console.log(map);

  header.innerText = map.package;

  const camera = new Camera(canvasContainer, map);
  mapRenderer?.dispose();
  mapRenderer = new MapRenderer(map, camera);
  mapRenderer.start();
}

async function readModFromUrl(
  url: string,
  onProgress: OnProgress,
): Promise<Result<void>> {
  const modDownloader = new ModDownloader();
  const downloadResult = await modDownloader.download(url);
  if (downloadResult.isFailure) {
    return Result.failure(downloadResult.failure);
  }
  const downloadResponse = downloadResult.success;

  const modResult = await responseProgress(downloadResponse, progress => {
    progress *= 0.99;
    onProgress(progress);
  });
  if (modResult.isFailure) {
    return Result.failure(modResult.failure);
  }

  const modDataResult = await modReader.read(
    toArrayBuffer(modResult.success.buffer),
  );
  if (modDataResult.isFailure) {
    return Result.failure(modDataResult.failure);
  }
  onProgress(1);
  await createModList(modDataResult.success);
  modUploadInput.value = '';
  return Result.success();
}

async function createModList(modData: ModData) {
  mapList.innerHTML = originalMapListContent;

  for (const map of modData.maps) {
    const option = document.createElement('option');
    option.innerText = map.name;
    option.value = map.name;
    mapList.appendChild(option);
  }
  const onlyOneMap = modData.maps.length === 1;
  mapList.selectedIndex = onlyOneMap ? 1 : 0;

  mapList.classList.add('pop');

  if (onlyOneMap) {
    showMap(modData.maps[0]);
  }

  mapList.onchange = _ => {
    const index = mapList.selectedIndex - 1;
    if (index < 0 || index > modData.maps.length) {
      throw new Error(
        `index ${index} was outside the bounds of the maps array`,
      );
    }

    mapListPlaceholder.hidden = false;

    const mapData = modData.maps[index];

    if (!mapData) {
      mapListPlaceholder.hidden = true;
      throw new Error(`Could not find ${mapList.options[index].value} in maps`);
    }

    showMap(mapData);
  };
}
