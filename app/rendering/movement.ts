const canvas = <HTMLCanvasElement>document.getElementById('canvas');
const canvasContainer = document.getElementById('canvasContainer')!;

let onClickData: ClickData[] = [];
canvasContainer.onmousedown = event => {
  if (event.button == 1 || event.buttons == 4) {
    event.preventDefault();
    onClickStart(event.clientX, event.clientY);
  }
};

function onClickStart(x: number, y: number) {
  const transformString = canvas.style.transform;
  let canvasX = 0;
  let canvasY = 0;
  if (transformString) {
    [canvasX, canvasY] = transformString
      .replace('translate(', '')
      .replace('px', '')
      .replace(')', '')
      .split(', ')
      .map(val => {
        return parseInt(val);
      });

    canvasX ??= 0;
    canvasY ??= 0;
  }
  onClickData.push(new ClickData(x, y, canvasX, canvasY));
}

onmouseup = event => {
  if (event.button == 1 || event.buttons == 4) {
    event.preventDefault();
    onClickData.pop();
  }
};

onmousemove = event => {
  if (onClickData.length <= 0) {
    return;
  }
  event.preventDefault();

  onMove(event.clientX, event.clientY);
};

function onMove(xPos: number, yPos: number) {
  const clickData = onClickData[0];

  let x = clickData.canvasX + xPos - clickData.x;
  let y = clickData.canvasY + yPos - clickData.y;

  const boundingRect = canvasContainer.getBoundingClientRect();
  console.log(boundingRect.width);
  const sizeOffset = 50; // margin + border*2 = 10 + 20*2
  x = Math.max(-canvas.width + boundingRect.width - sizeOffset, x);
  x = Math.min(0, x);
  y = Math.max(-canvas.height + boundingRect.height - sizeOffset, y);
  y = Math.min(0, y);

  canvas.style.transform = `translate(${x}px, ${y}px)`;
}

if (typeof canvas.ontouchstart !== 'undefined') {
  canvasContainer.ontouchstart = event => {
    event.preventDefault();

    onClickStart(
      event.changedTouches[0].clientX,
      event.changedTouches[0].clientY,
    );
  };

  ontouchend = event => {
    event.preventDefault();
    onClickData.pop();
  };

  ontouchcancel = event => {
    event.preventDefault();
    onClickData.pop();
  };

  ontouchmove = event => {
    if (!onClickData) {
      return;
    }
    event.preventDefault();

    const changedTouch = event.changedTouches[0];

    onMove(changedTouch.clientX, changedTouch.clientY);
  };
}

export class Movement {}

class ClickData {
  x: number;
  y: number;
  canvasX: number;
  canvasY: number;

  constructor(x: number, y: number, canvasX: number, canvasY: number) {
    this.x = x;
    this.y = y;
    this.canvasX = canvasX;
    this.canvasY = canvasY;
  }
}
