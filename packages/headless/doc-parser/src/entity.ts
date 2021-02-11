import {Parameter} from '@microsoft/api-extractor-model';
import {DocComment, DocNode} from '@microsoft/tsdoc';
import {emitAsTsDoc} from './tsdoc-emitter';

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
  const desc = getSummary(config.comment);

  return {
    name: config.name,
    isOptional: config.isOptional,
    type,
    desc,
  };
}

export function buildParamEntity(param: Parameter): Entity {
  const desc = getParamDescription(param);
  const type = sanitizeType(param.parameterTypeExcerpt.text);

  return {
    name: param.name,
    isOptional: false,
    desc,
    type,
  };
}

export function buildFuncEntity(config: FuncEntity): FuncEntity {
  return {...config};
}

function sanitizeType(type: string) {
  return type.replace(/\$[0-9]{1}/, '');
}

function getSummary(comment: DocComment | undefined) {
  if (!comment) {
    return '';
  }

  try {
    return emitAsTsDoc(comment.summarySection.nodes);
  } catch (e) {
    console.log(
      'failed to get summary for comment:\n',
      comment.emitAsTsdoc(),
      e
    );
    return '';
  }
}

function getParamDescription(param: Parameter) {
  const nodes = param.tsdocParamBlock?.content.getChildNodes() || [];

  try {
    return emitAsTsDoc((nodes as unknown) as readonly DocNode[]);
  } catch (e) {
    console.log('failed to description for param:', param.name, e);
    return '';
  }
}
