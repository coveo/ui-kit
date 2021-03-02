import {
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
} from './entity-builder';

export function resolveInterfaceMembers(
  entry: ApiEntryPoint,
  apiInterface: ApiInterface,
  ancestorNames: string[]
): AnyEntity[] {
  if (ancestorNames.includes(apiInterface.name)) {
    return [];
  }
  const ancestorNamesForChildren = [...ancestorNames, apiInterface.name];
  const members = resolveMembers(entry, apiInterface, ancestorNamesForChildren);
  const inheritedMembers = resolveInheritedMembers(
    entry,
    apiInterface,
    ancestorNamesForChildren
  );

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

function resolveMembers(
  entry: ApiEntryPoint,
  apiInterface: ApiInterface,
  ancestorNames: string[]
) {
  return apiInterface.members.map((m) => {
    if (isPropertySignature(m)) {
      return resolvePropertySignature(entry, m, ancestorNames);
    }

    if (isMethodSignature(m)) {
      return resolveMethodSignature(entry, m, ancestorNames);
    }

    throw new Error(`Unsupported member: ${m.displayName}`);
  });
}

function resolveInheritedMembers(
  entry: ApiEntryPoint,
  apiInterface: ApiInterface,
  ancestorNames: string[]
) {
  return apiInterface.extendsTypes
    .map((m) => {
      const typeName = extractTypeName(m.excerpt);
      const inheritedInterface = findApi(entry, typeName) as ApiInterface;
      return resolveInterfaceMembers(entry, inheritedInterface, ancestorNames);
    })
    .reduce((acc, curr) => acc.concat(curr), []);
}

function isPropertySignature(item: ApiItem): item is ApiPropertySignature {
  return item.kind === ApiItemKind.PropertySignature;
}

function resolvePropertySignature(
  entry: ApiEntryPoint,
  p: ApiPropertySignature,
  ancestorNames: string[]
) {
  const typeExcerpt = p.propertyTypeExcerpt.spannedTokens[0];

  if (isRecordType(typeExcerpt)) {
    return buildEntityFromProperty(p);
  }

  if (isTypeAlias(typeExcerpt)) {
    return buildEntityFromPropertyAndResolveTypeAlias(entry, p);
  }

  if (isReference(typeExcerpt)) {
    return buildObjEntityFromProperty(entry, p, ancestorNames);
  }

  return buildEntityFromProperty(p);
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
  p: ApiPropertySignature,
  ancestorNames: string[]
) {
  const typeName = extractTypeName(p.propertyTypeExcerpt);
  const searchableTypeName = extractSearchableTypeName(p.propertyTypeExcerpt);
  const apiInterface = findApi(entry, searchableTypeName) as ApiInterface;
  const members = resolveInterfaceMembers(entry, apiInterface, ancestorNames);
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

function resolveMethodSignature(
  entry: ApiEntryPoint,
  m: ApiMethodSignature,
  ancestorNames: string[]
) {
  const params = m.parameters.map((p) =>
    resolveParameter(entry, p, ancestorNames)
  );
  const returnType = m.returnTypeExcerpt.text;

  return buildFuncEntity({
    name: m.displayName,
    comment: (m.tsdocComment as unknown) as DocComment,
    params,
    returnType,
  });
}

export function resolveParameter(
  entry: ApiEntryPoint,
  p: Parameter,
  ancestorNames: string[]
) {
  const typeExcerpt = p.parameterTypeExcerpt.spannedTokens[0];

  if (isTypeAlias(typeExcerpt)) {
    return buildEntityFromParamAndResolveTypeAlias(entry, p);
  }

  if (isReference(typeExcerpt)) {
    return buildObjEntityFromParam(entry, p, ancestorNames);
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

function buildObjEntityFromParam(
  entryPoint: ApiEntryPoint,
  p: Parameter,
  ancestorNames: string[]
) {
  const typeName = extractTypeName(p.parameterTypeExcerpt);
  const searchableTypeName = extractSearchableTypeName(p.parameterTypeExcerpt);
  const apiInterface = findApi(entryPoint, searchableTypeName) as ApiInterface;
  const members = resolveInterfaceMembers(
    entryPoint,
    apiInterface,
    ancestorNames
  );
  const entity = buildParamEntity(p);

  return buildObjEntity({entity, members, typeName});
}

function extractTypeName(excerpt: Excerpt) {
  return excerpt.text.replace(/\[\]/, '');
}

function extractSearchableTypeName(excerpt: Excerpt) {
  return excerpt.spannedTokens[0].text;
}
