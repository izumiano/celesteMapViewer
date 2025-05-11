import {MapBinReader} from './mapBinReader.js';

function draw() {
  const canvas = <HTMLCanvasElement>document.getElementById('canvas');
  if (canvas.getContext) {
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
      throw new Error('ctx was null');
    }

    ctx.beginPath();
    ctx.arc(75, 75, 50, 0, Math.PI * 2, true); // Outer circle
    ctx.moveTo(110, 75);
    ctx.arc(75, 75, 35, 0, Math.PI, false); // Mouth (clockwise)
    ctx.moveTo(65, 65);
    ctx.arc(60, 65, 5, 0, Math.PI * 2, true); // Left eye
    ctx.moveTo(95, 65);
    ctx.arc(90, 65, 5, 0, Math.PI * 2, true); // Right eye
    ctx.stroke();
  }
}

draw();

async function run() {
  // const map = await new MapBinReader().decodeFile('../testData/0-Prologue.bin');
  const map = await new MapBinReader().decodeFile(
    '../testData/6-ReflectionD-B.bin',
  );

  console.log(map);
}

run();
