const canvas = <HTMLCanvasElement>document.getElementById('canvas');

let onClickData: ClickData[] = [];
canvas.onmousedown = event => {
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
  }
  onClickData.push(new ClickData(x, y, canvasX, canvasY));
}

canvas.onmouseup = event => {
  if (event.button == 1 || event.buttons == 4) {
    event.preventDefault();
    onClickData.pop();
  }
};

canvas.onmousemove = event => {
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

  x = isNaN(x) ? 0 : x;
  y = isNaN(y) ? 0 : y;

  x = Math.max(-canvas.width + innerWidth - (8 * 2 + 5 * 2), x);
  x = Math.min(0, x);
  y = Math.max(-canvas.height + innerHeight - (8 * 2 + 5 * 2), y);
  y = Math.min(0, y);

  canvas.style.transform = `translate(${x}px, ${y}px)`;
}

if (typeof canvas.ontouchstart !== 'undefined') {
  canvas.ontouchstart = event => {
    event.preventDefault();

    onClickStart(
      event.changedTouches[0].clientX,
      event.changedTouches[0].clientY,
    );
  };

  canvas.ontouchend = event => {
    event.preventDefault();
    onClickData.pop();
  };

  canvas.ontouchcancel = event => {
    event.preventDefault();
    onClickData.pop();
  };

  canvas.ontouchmove = event => {
    if (!onClickData) {
      return;
    }
    event.preventDefault();

    const clickData = onClickData[0];
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
