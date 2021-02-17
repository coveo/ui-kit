export interface Entity {
  name: string;
  desc: string;
  type: string;
  isOptional: boolean;
}

export interface ObjEntity extends Entity {
  members: AnyEntity[];
  isExtracted: boolean;
}

export interface FuncEntity {
  name: string;
  desc: string;
  params: AnyEntity[];
  returnType: string | ObjEntity | FuncEntity;
}

export type AnyEntity = Entity | ObjEntity | FuncEntity;
