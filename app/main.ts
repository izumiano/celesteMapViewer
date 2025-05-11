import {MapBinReader} from './mapBinReader.js';
import {CelesteMap} from './mapTypes/celesteMap.js';
import {TileMatrix} from './mapTypes/tileMatrix.js';

const scale = 8 * 5;

function draw(map: CelesteMap) {
  const canvas = <HTMLCanvasElement>document.getElementById('canvas');
  if (canvas.getContext) {
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
      throw new Error('ctx was null');
    }

    const tiles = map.levels[2].solids;
    if (!tiles) {
      console.error('Tiles was undefined');
      return;
    }

    canvas.width = tiles.width * scale;
    canvas.height = tiles.height * scale;

    drawSolids(tiles, ctx);
  }
}

function drawSolids(tiles: TileMatrix, ctx: CanvasRenderingContext2D) {
  for (let y = 0; y < tiles.height; y++) {
    for (let x = 0; x < tiles.width; x++) {
      if (tiles.get(x, y) < 1) {
        continue;
      }
      ctx.strokeStyle = 'rgb(0 0 0)';
      ctx.strokeRect(x * scale, y * scale, scale, scale);
    }
  }
}

async function run() {
  const map = await new MapBinReader().decodeFile('../testData/0-Prologue.bin');
  // const map = await new MapBinReader().decodeFile(
  //   '../testData/6-ReflectionD-B.bin',
  // );

  console.log(map);

  console.log(map.levels[1].solids?.toStr());
  draw(map);
}

run();
