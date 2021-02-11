import {DocComment} from '@microsoft/tsdoc';

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

interface EntityOptions {
  name: string;
  type: string;
  isOptional: boolean;
  comment: DocComment | undefined;
}

export function buildEntity(config: EntityOptions): Entity {
  const type = sanitizeType(config.type);
  const desc = config.comment?.emitAsTsdoc() || '';

  return {
    name: config.name,
    isOptional: config.isOptional,
    type,
    desc,
  };
}

export function buildFuncEntity(config: FuncEntity): FuncEntity {
  return {...config};
}

function sanitizeType(type: string) {
  return type.replace(/\$[0-9]{1}/, '');
}
