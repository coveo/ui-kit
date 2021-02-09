export interface Entity {
  name: string;
  desc: string;
  type: string;
  isOptional: boolean;
}

export interface ObjEntity extends Entity {
  members: AnyEntity[];
}

export interface FuncEntity {
  name: string;
  desc: string;
  params: AnyEntity[];
  returnType: string | ObjEntity | FuncEntity;
}

export type AnyEntity = Entity | ObjEntity | FuncEntity;

export function buildEntity(config: Entity): Entity {
  return {...config};
}

export function buildObjEntity(config: ObjEntity): ObjEntity {
  return {...config};
}

export function buildFuncEntity(config: FuncEntity): FuncEntity {
  return {...config};
}
