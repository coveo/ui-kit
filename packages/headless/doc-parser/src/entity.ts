export interface Entity {
  name: string;
  desc: string;
  type: string;
  isOptional: boolean;
}

export interface ObjEntity extends Entity {
  members: AnyEntity[];
  isTypeExtracted: boolean;
  typeName: string;
}

export interface FuncEntity {
  name: string;
  desc: string;
  params: AnyEntity[];
  returnType: string | ObjEntity | FuncEntity;
}

export type AnyEntity = Entity | ObjEntity | FuncEntity;

export function isObjectEntity(entity: unknown): entity is ObjEntity {
  if (typeof entity !== 'object') {
    return false;
  }

  return !!entity && 'members' in entity;
}

export function isFunctionEntity(entity: unknown): entity is FuncEntity {
  if (typeof entity !== 'object') {
    return false;
  }

  return !!entity && 'params' in entity;
}
