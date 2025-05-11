import {Level} from './level.js';

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
