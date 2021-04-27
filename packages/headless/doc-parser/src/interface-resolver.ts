import {
  ApiCallSignature,
  ApiEntryPoint,
  ApiIndexSignature,
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
import {AnyEntity, EntityWithTypeAlias} from './entity';
import {
  buildEntity,
  buildFuncEntity,
  buildObjEntity,
  buildParamEntity,
  buildReturnTypeEntity,
} from './entity-builder';
import {sortEntities} from './entity-sorter';

export function resolveInterfaceMembers(
  entry: ApiEntryPoint,
  apiInterface: ApiInterface,
  ancestorNames: string[]
): AnyEntity[] {
  if (
    ancestorNames.filter((ancestorName) => ancestorName === apiInterface.name)
      .length >= 2
  ) {
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

  const filtered = inheritedMembers.filter((m) => {
    const shouldKeep = !memberNames.has(m.name);
    memberNames.add(m.name);
    return shouldKeep;
  });

  return members.concat(filtered);
}

function resolveMembers(
  entry: ApiEntryPoint,
  apiInterface: ApiInterface,
  ancestorNames: string[]
) {
  const members = apiInterface.members.map((m) => {
    if (isPropertySignature(m)) {
      return resolvePropertySignature(entry, m, ancestorNames);
    }

    if (isMethodSignature(m)) {
      return resolveMethodSignature(entry, m, ancestorNames);
    }

    if (isCallSignature(m)) {
      return resolveCallSignature(m);
    }

    if (isIndexSignature(m)) {
      return resolveIndexSignature(m);
    }

    throw new Error(`Unsupported member: ${m.displayName}`);
  });

  return sortEntities(members);
}

function resolveInheritedMembers(
  entry: ApiEntryPoint,
  apiInterface: ApiInterface,
  ancestorNames: string[]
) {
  return apiInterface.extendsTypes
    .map((m) => {
      const typeName = extractSearchableTypeName(m.excerpt);
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
  const typeName = extractTypeName(p.propertyTypeExcerpt);

  if (isRecordType(typeExcerpt)) {
    return buildEntityFromProperty(p);
  }

  if (isUnionType(typeName)) {
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
): EntityWithTypeAlias {
  const entity = buildEntityFromProperty(p);
  const searchableTypeName = extractSearchableTypeName(p.propertyTypeExcerpt);
  const typeAlias = findApi(entry, searchableTypeName) as ApiTypeAlias;
  const type = typeAlias.typeExcerpt.text;

  return {...entity, kind: 'primitive-with-type-alias', type};
}

function isIndexSignature(m: ApiItem): m is ApiIndexSignature {
  return m.kind === ApiItemKind.IndexSignature;
}

function resolveIndexSignature(m: ApiIndexSignature) {
  const params = m.parameters
    .map((p) => `${p.name}: ${p.parameterTypeExcerpt.text}`)
    .join(',');

  const name = `[${params}]`;
  const type = m.returnTypeExcerpt.text;

  return buildEntity({
    name,
    type,
    isOptional: false,
    comment: (m.tsdocComment as unknown) as DocComment,
  });
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
  const returnType = resolveMethodReturnType(entry, m, ancestorNames);

  return buildFuncEntity({
    name: m.displayName,
    comment: (m.tsdocComment as unknown) as DocComment,
    params,
    returnType,
  });
}

function resolveMethodReturnType(
  entry: ApiEntryPoint,
  m: ApiMethodSignature,
  ancestorNames: string[]
) {
  const typeExcerpt = m.returnTypeExcerpt.spannedTokens[0];

  if (isPromise(typeExcerpt)) {
    return buildReturnTypeEntity(m);
  }

  if (isTypeAlias(typeExcerpt)) {
    return buildReturnTypeEntity(m);
  }

  if (isReference(typeExcerpt)) {
    return buildObjEntityFromReturnType(entry, m, ancestorNames);
  }

  return buildReturnTypeEntity(m);
}

function buildObjEntityFromReturnType(
  entry: ApiEntryPoint,
  m: ApiMethodSignature,
  ancestorNames: string[]
) {
  const typeName = extractTypeName(m.returnTypeExcerpt);
  const searchableTypeName = extractSearchableTypeName(m.returnTypeExcerpt);
  const apiInterface = findApi(entry, searchableTypeName) as ApiInterface;
  const members = resolveInterfaceMembers(entry, apiInterface, ancestorNames);
  const entity = buildReturnTypeEntity(m);

  return buildObjEntity({entity, members, typeName});
}

export function resolveParameter(
  entry: ApiEntryPoint,
  p: Parameter,
  ancestorNames: string[]
) {
  const typeExcerpt = p.parameterTypeExcerpt.spannedTokens[0];
  const type = p.parameterTypeExcerpt.text;

  if (isTypeAlias(typeExcerpt)) {
    return buildEntityFromParamAndResolveTypeAlias(entry, p);
  }

  if (isUnionType(type)) {
    return buildParamEntity(p);
  }

  if (isReference(typeExcerpt)) {
    return buildObjEntityFromParam(entry, p, ancestorNames);
  }

  return buildParamEntity(p);
}

function buildEntityFromParamAndResolveTypeAlias(
  entry: ApiEntryPoint,
  p: Parameter
): EntityWithTypeAlias {
  const entity = buildParamEntity(p);
  const searchableTypeName = extractSearchableTypeName(p.parameterTypeExcerpt);
  const typeAlias = findApi(entry, searchableTypeName) as ApiTypeAlias;
  const type = typeAlias.typeExcerpt.text;

  return {...entity, kind: 'primitive-with-type-alias', type};
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

function isPromise(token: ExcerptToken) {
  const isPromise = token.text === 'Promise';
  return isReference(token) && isPromise;
}

function isReference(token: ExcerptToken) {
  return token.kind === ExcerptTokenKind.Reference;
}

function isUnionType(typeName: string) {
  return typeName.includes('|');
}
