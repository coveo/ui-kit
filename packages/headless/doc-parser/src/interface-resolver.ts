import {
  ApiEntryPoint,
  ApiInterface,
  ApiItem,
  ApiItemKind,
  ApiMethodSignature,
  ApiPropertySignature,
  ApiTypeAlias,
  ExcerptTokenKind,
  Parameter,
} from '@microsoft/api-extractor-model';
import {findApi} from './api-finder';
import {AnyEntity, Entity, FuncEntity, ObjEntity} from './entity';

export function resolveInterfaceMembers(
  entry: ApiEntryPoint,
  apiInterface: ApiInterface
): AnyEntity[] {
  return apiInterface.members.map((m) => {
    if (isPropertySignature(m)) {
      return resolvePropertySignature(entry, m);
    }

    if (isMethodSignature(m)) {
      return resolveMethodSignature(m);
    }

    throw new Error(`Unsupported member: ${m.displayName}`);
  });
}

function isPropertySignature(item: ApiItem): item is ApiPropertySignature {
  return item.kind === ApiItemKind.PropertySignature;
}

function resolvePropertySignature(
  entry: ApiEntryPoint,
  p: ApiPropertySignature
) {
  if (isRecordType(p)) {
    return buildEntityFromProperty(p);
  }

  if (isPropertyUsingTypeAlias(p)) {
    return buildEntityFromPropertyAndResolveTypeAlias(entry, p);
  }

  if (isReference(p)) {
    return buildObjEntityFromProperty(entry, p);
  }

  return buildEntityFromProperty(p);
}

function isPropertyUsingTypeAlias(m: ApiPropertySignature) {
  const {canonicalReference} = m.propertyTypeExcerpt.spannedTokens[0];
  const canonicalRef = canonicalReference?.toString() || '';
  return /:type$/.test(canonicalRef);
}

function isRecordType(p: ApiPropertySignature) {
  const {text} = p.propertyTypeExcerpt.spannedTokens[0];
  const isRecord = text === 'Record';

  return isReference(p) && isRecord;
}

function isReference(m: ApiPropertySignature) {
  const {kind} = m.propertyTypeExcerpt.spannedTokens[0];
  return kind === ExcerptTokenKind.Reference;
}

function buildEntityFromProperty(p: ApiPropertySignature): Entity {
  return {
    name: p.name,
    desc: p.tsdocComment?.emitAsTsdoc() || '',
    isOptional: p.isOptional,
    type: p.propertyTypeExcerpt.text,
  };
}

function buildObjEntityFromProperty(
  entry: ApiEntryPoint,
  p: ApiPropertySignature
): ObjEntity {
  const entity = buildEntityFromProperty(p);
  const apiInterface = findApi(entry, entity.type) as ApiInterface;
  const members = resolveInterfaceMembers(entry, apiInterface);

  return {...entity, members};
}

function buildEntityFromPropertyAndResolveTypeAlias(
  entry: ApiEntryPoint,
  p: ApiPropertySignature
): Entity {
  const entity = buildEntityFromProperty(p);
  const alias = p.propertyTypeExcerpt.text;
  const typeAlias = findApi(entry, alias) as ApiTypeAlias;
  const type = typeAlias.typeExcerpt.text;

  return {...entity, type};
}

function isMethodSignature(m: ApiItem): m is ApiMethodSignature {
  return m.kind === ApiItemKind.MethodSignature;
}

function resolveMethodSignature(m: ApiMethodSignature): FuncEntity {
  const params = m.parameters.map((p) => buildEntityFromParam(p));
  const returnType = m.returnTypeExcerpt.text;

  return {
    name: m.displayName,
    desc: m.tsdocComment?.emitAsTsdoc() || '',
    params,
    returnType,
  };
}

function buildEntityFromParam(p: Parameter): Entity {
  return {
    name: p.name,
    desc: '',
    isOptional: false,
    type: p.parameterTypeExcerpt.text,
  };
}
