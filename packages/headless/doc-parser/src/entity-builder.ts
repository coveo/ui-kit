import {Parameter} from '@microsoft/api-extractor-model';
import {DocComment, DocNode, DocNodeKind} from '@microsoft/tsdoc';
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

interface ObjEntityOptions {
  entity: Entity;
  members: AnyEntity[];
  typeName: string;
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
    kind: 'primitive',
    name: config.name,
    isOptional: config.isOptional,
    type,
    desc,
  };
}

export function buildObjEntity(config: ObjEntityOptions): ObjEntity {
  const {entity, members} = config;
  const typeName = sanitizeType(config.typeName);

  return {
    ...entity,
    kind: 'object',
    members,
    isTypeExtracted: false,
    typeName,
  };
}

export function buildParamEntity(param: Parameter): Entity {
  const desc = getParamDescription(param);
  const type = sanitizeType(param.parameterTypeExcerpt.text);

  return {
    kind: 'primitive',
    name: param.name,
    isOptional: false,
    desc,
    type,
  };
}

export function buildFuncEntity(config: FuncEntityOptions): FuncEntity {
  const desc = getSummary(config.comment);

  return {
    kind: 'function',
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
    const nodes = removeBlockTagNodes(comment.summarySection.nodes);
    return emitAsTsDoc(nodes);
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
  const description = emitAsTsDoc((nodes as unknown) as readonly DocNode[]);

  if (!description) {
    throw new Error(`No description found for param: ${param.name}`);
  }

  return description;
}

function removeBlockTagNodes(nodes: readonly DocNode[]) {
  return nodes.filter((n) => !hasBlockTag([n]));
}

function hasBlockTag(nodes: readonly DocNode[]): boolean {
  return nodes.some((n) => {
    const isBlockTag = n.kind === DocNodeKind.BlockTag;
    const hasBlockTagChild = hasBlockTag(n.getChildNodes());
    return isBlockTag || hasBlockTagChild;
  });
}
