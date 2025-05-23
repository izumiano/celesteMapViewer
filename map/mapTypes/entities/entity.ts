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
}
