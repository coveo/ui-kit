type EntityKind = 'primitive' | 'object' | 'function';

interface Kind<T extends EntityKind> {
  kind: T;
}

interface Name {
  name: string;
}

interface Description {
  desc: string;
}

interface Type {
  type: string;
}

interface Optional {
  isOptional: boolean;
}

export interface Entity
  extends Kind<'primitive'>,
    Name,
    Description,
    Type,
    Optional {}

export interface ObjEntity
  extends Kind<'object'>,
    Name,
    Description,
    Type,
    Optional {
  members: AnyEntity[];
  isTypeExtracted: boolean;
  typeName: string;
}

export interface FuncEntity extends Kind<'function'>, Name, Description {
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
