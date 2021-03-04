import {
  ApiCallSignature,
  ApiEntryPoint,
  ApiInterface,
  ApiItem,
  ApiItemKind,
  ApiMethodSignature,
  ApiPropertySignature,
  ApiTypeAlias,
  Excerpt,
  ExcerptToken,
  ExcerptTokenKind,
  Parameter,
} from '@microsoft/api-extractor-model';
import {DocComment} from '@microsoft/tsdoc';
import {findApi} from './api-finder';
import {AnyEntity, Entity} from './entity';
import {
  buildEntity,
  buildFuncEntity,
  buildObjEntity,
  buildParamEntity,
  buildReturnTypeEntity,
} from './entity-builder';

export function resolveInterfaceMembers(
  entry: ApiEntryPoint,
  apiInterface: ApiInterface
): AnyEntity[] {
  const members = resolveMembers(entry, apiInterface);
  const inheritedMembers = resolveInheritedMembers(entry, apiInterface);

  return filterOverridesAndCombine(members, inheritedMembers);
}

function filterOverridesAndCombine(
  members: AnyEntity[],
  inheritedMembers: AnyEntity[]
) {
  const memberNames = new Set();
  members.forEach((m) => memberNames.add(m.name));
  const filtered = inheritedMembers.filter((m) => !memberNames.has(m.name));

  return members.concat(filtered);
}

function resolveMembers(entry: ApiEntryPoint, apiInterface: ApiInterface) {
  return apiInterface.members.map((m) => {
    if (isPropertySignature(m)) {
      return resolvePropertySignature(entry, m);
    }

    if (isMethodSignature(m)) {
      return resolveMethodSignature(entry, m);
    }

    if (isCallSignature(m)) {
      return resolveCallSignature(m);
    }

    throw new Error(`Unsupported member: ${m.displayName}`);
  });
}

function resolveInheritedMembers(
  entry: ApiEntryPoint,
  apiInterface: ApiInterface
) {
  return apiInterface.extendsTypes
    .map((m) => {
      const typeName = extractSearchableTypeName(m.excerpt);
      const inheritedInterface = findApi(entry, typeName) as ApiInterface;
      return resolveInterfaceMembers(entry, inheritedInterface);
    })
    .reduce((acc, curr) => acc.concat(curr), []);
}

function isPropertySignature(item: ApiItem): item is ApiPropertySignature {
  return item.kind === ApiItemKind.PropertySignature;
}

function resolvePropertySignature(
  entry: ApiEntryPoint,
  p: ApiPropertySignature
) {
  const typeExcerpt = p.propertyTypeExcerpt.spannedTokens[0];
  if (isRecordType(typeExcerpt)) {
    return buildEntityFromProperty(p);
  }

  if (isTypeAlias(typeExcerpt)) {
    return buildEntityFromPropertyAndResolveTypeAlias(entry, p);
  }

  if (isReference(typeExcerpt)) {
    return buildObjEntityFromProperty(entry, p);
  }

  return buildEntityFromProperty(p);
}

function buildEntityFromProperty(p: ApiPropertySignature) {
  return buildEntity({
    name: p.name,
    comment: (p.tsdocComment as unknown) as DocComment,
    isOptional: p.isOptional,
    type: p.propertyTypeExcerpt.text,
  });
}

function buildObjEntityFromProperty(
  entry: ApiEntryPoint,
  p: ApiPropertySignature
) {
  const typeName = extractTypeName(p.propertyTypeExcerpt);
  const searchableTypeName = extractSearchableTypeName(p.propertyTypeExcerpt);
  const apiInterface = findApi(entry, searchableTypeName) as ApiInterface;
  const members = resolveInterfaceMembers(entry, apiInterface);
  const entity = buildEntityFromProperty(p);

  return buildObjEntity({entity, members, typeName});
}

function buildEntityFromPropertyAndResolveTypeAlias(
  entry: ApiEntryPoint,
  p: ApiPropertySignature
): Entity {
  const entity = buildEntityFromProperty(p);
  const searchableTypeName = extractSearchableTypeName(p.propertyTypeExcerpt);
  const typeAlias = findApi(entry, searchableTypeName) as ApiTypeAlias;
  const type = typeAlias.typeExcerpt.text;

  return {...entity, type};
}

function isMethodSignature(m: ApiItem): m is ApiMethodSignature {
  return m.kind === ApiItemKind.MethodSignature;
}

function resolveMethodSignature(entry: ApiEntryPoint, m: ApiMethodSignature) {
  const params = m.parameters.map((p) => resolveParameter(entry, p));
  const typeExcerpt = m.returnTypeExcerpt.spannedTokens[0];
  let returnType: AnyEntity = buildReturnTypeEntity(m);
  if (isReference(typeExcerpt)) {
    returnType = buildObjEntityFromReturnType(entry, m);
  }

  return buildFuncEntity({
    name: m.displayName,
    comment: (m.tsdocComment as unknown) as DocComment,
    params,
    returnType,
  });
}

function buildObjEntityFromReturnType(
  entry: ApiEntryPoint,
  m: ApiMethodSignature
) {
  const typeName = extractTypeName(m.returnTypeExcerpt);
  const searchableTypeName = extractSearchableTypeName(m.returnTypeExcerpt);
  const apiInterface = findApi(entry, searchableTypeName) as ApiInterface;
  const members = resolveInterfaceMembers(entry, apiInterface);
  const entity = buildReturnTypeEntity(m);

  return buildObjEntity({entity, members, typeName});
}

export function resolveParameter(entry: ApiEntryPoint, p: Parameter) {
  const typeExcerpt = p.parameterTypeExcerpt.spannedTokens[0];

  if (isTypeAlias(typeExcerpt)) {
    return buildEntityFromParamAndResolveTypeAlias(entry, p);
  }

  if (isReference(typeExcerpt)) {
    return buildObjEntityFromParam(entry, p);
  }

  return buildParamEntity(p);
}

function buildEntityFromParamAndResolveTypeAlias(
  entry: ApiEntryPoint,
  p: Parameter
): Entity {
  const entity = buildParamEntity(p);
  const searchableTypeName = extractSearchableTypeName(p.parameterTypeExcerpt);
  const typeAlias = findApi(entry, searchableTypeName) as ApiTypeAlias;
  const type = typeAlias.typeExcerpt.text;

  return {...entity, type};
}

function buildObjEntityFromParam(entryPoint: ApiEntryPoint, p: Parameter) {
  const typeName = extractTypeName(p.parameterTypeExcerpt);
  const searchableTypeName = extractSearchableTypeName(p.parameterTypeExcerpt);
  const apiInterface = findApi(entryPoint, searchableTypeName) as ApiInterface;
  const members = resolveInterfaceMembers(entryPoint, apiInterface);
  const entity = buildParamEntity(p);

  return buildObjEntity({entity, members, typeName});
}

function isCallSignature(c: ApiItem): c is ApiCallSignature {
  return c.kind === ApiItemKind.CallSignature;
}

function resolveCallSignature(c: ApiCallSignature) {
  return buildEntity({
    name: c.displayName,
    type: c.returnTypeExcerpt.tokens.map((t) => t.text).join(''),
    isOptional: false,
    comment: (c.tsdocComment as unknown) as DocComment,
  });
}

function extractTypeName(excerpt: Excerpt) {
  return excerpt.text.replace(/\[\]/, '');
}

function extractSearchableTypeName(excerpt: Excerpt) {
  return excerpt.spannedTokens[0].text;
}

function isTypeAlias(token: ExcerptToken) {
  const meaning = token.canonicalReference?.symbol?.meaning;
  return meaning === 'type';
}

function isRecordType(token: ExcerptToken) {
  const isRecord = token.text === 'Record';
  return isReference(token) && isRecord;
}

function isReference(token: ExcerptToken) {
  return token.kind === ExcerptTokenKind.Reference;
}
