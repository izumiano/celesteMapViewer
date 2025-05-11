export class CelesteMap {
  name: string;
  package: string;
  levels: Level[];

  constructor(map: {[key: string]: any}) {
    console.debug(map);

    this.name = map.__name;
    this.package = map._package;
    this.levels = Level.toLevelArray(
      map.__children.find(
        (child: {[key: string]: any}) => child.__name === 'levels',
      ).__children,
    );
  }
}

class Level {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;

  children: {[key: string]: any};

  static toLevelArray(levels: {[key: string]: any}): Level[] {
    const ret: Level[] = [];

    for (const [_, level] of levels.entries()) {
      ret.push(new Level(level));
    }

    return ret;
  }

  constructor(level: {[key: string]: any}) {
    this.name = level.name;
    this.x = level.x;
    this.y = level.y;
    this.width = level.width;
    this.height = level.height;
    this.children = level.__children;
  }
}
