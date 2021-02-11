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
  const type = sanitizeType(config.type);
  return {...config, type};
}

export function buildObjEntity(config: ObjEntity): ObjEntity {
  const type = sanitizeType(config.type);
  return {...config, type};
}

export function buildFuncEntity(config: FuncEntity): FuncEntity {
  return {...config};
}

function sanitizeType(type: string) {
  return type.replace(/\$[0-9]{1}/, '');
}
