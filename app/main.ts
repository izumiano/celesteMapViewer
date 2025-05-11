import {MapBinReader} from './mapBinReader.js';
import {MapRenderer} from './rendering/mapRenderer.js';
import {Movement} from './rendering/movement.js';

async function run() {
  const map = await new MapBinReader().decodeFile('../testData/0-Prologue.bin');
  // const map = await new MapBinReader().decodeFile(
  //   '../testData/6-ReflectionD-B.bin',
  // );

  console.log(map);
  new MapRenderer(map).draw();

  new Movement();
}

run();
