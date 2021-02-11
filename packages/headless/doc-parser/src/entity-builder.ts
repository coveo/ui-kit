import {Parameter} from '@microsoft/api-extractor-model';
import {DocComment, DocNode} from '@microsoft/tsdoc';
import {AnyEntity, Entity, FuncEntity, ObjEntity} from './entity';
import {emitAsTsDoc} from './tsdoc-emitter';

interface Comment {
  comment: DocComment | undefined;
}

interface EntityOptions extends Comment {
  name: string;
  type: string;
  isOptional: boolean;
}

interface FuncEntityOptions extends Comment {
  name: string;
  params: AnyEntity[];
  returnType: string | ObjEntity | FuncEntity;
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

export function buildFuncEntity(config: FuncEntityOptions): FuncEntity {
  const desc = getSummary(config.comment);

  return {
    name: config.name,
    params: config.params,
    returnType: config.returnType,
    desc,
  };
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
