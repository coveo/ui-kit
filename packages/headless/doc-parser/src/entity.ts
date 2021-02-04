export interface Entity {
  name: string;
  type: string;
  isOptional: boolean;
  desc: string;
  // notes?: []
}

export interface ObjEntity extends Entity {
  members: Entity[];
}
