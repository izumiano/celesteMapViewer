export class Entity {
  name: string;
  x: number;
  y: number;
  width: number | undefined;
  height: number | undefined;

  constructor(entity: any) {
    this.name = entity.__name;
    this.x = entity.x;
    this.y = entity.y;
    this.width = entity.width;
    this.height = entity.height;
  }

  static toEntityList(entities: any[] | undefined) {
    let ret: Entity[] = [];

    if (!entities) {
      return ret;
    }

    for (const entity of entities) {
      ret.push(new Entity(entity));
    }

    return ret;
  }
}
