import {MapBinReader} from './mapBinReader.js';
import {MapRenderer} from './rendering/mapRenderer.js';

async function run() {
  // const map = await new MapBinReader().decodeFile('../testData/0-Prologue.bin');
  const map = await new MapBinReader().decodeFile(
    '../testData/6-ReflectionD-B.bin',
  );

  console.log(map);

  console.log(map.levels[0].solids?.toArr());
  new MapRenderer(map).draw();
}

run();
