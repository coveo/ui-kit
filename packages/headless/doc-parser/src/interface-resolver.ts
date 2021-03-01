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

export type InterfaceReferencesCount = Record<string, number>;

export function resolveInterface(
  entry: ApiEntryPoint,
  apiInterface: ApiInterface,
  referencesCount: InterfaceReferencesCount,
  source?: ApiPropertySignature | Parameter
) {
  const typeName = apiInterface.name;
  if (!referencesCount[typeName]) {
    referencesCount[typeName] = 1;
    const members = resolveInterfaceMembers(
      entry,
      apiInterface,
      referencesCount
    );

    return buildObjEntity({
      entity: buildEntityFromSource(source ?? apiInterface),
      members,
      typeName,
    });
  }
  referencesCount[typeName] += 1;

  const extractedEntity = buildObjEntity({
    entity: buildEntityFromSource(source ?? apiInterface),
    members: [],
    typeName,
  });
  extractedEntity.isTypeExtracted = true;
  return extractedEntity;
}

function buildEntityFromSource(
  source: ApiPropertySignature | Parameter | ApiInterface
) {
  if (source instanceof ApiPropertySignature) {
    return buildEntityFromProperty(source);
  }

  if (source instanceof Parameter) {
    return buildParamEntity(source);
  }

  return buildEntity({
    name: source.name,
    type: source.name,
    isOptional: false,
    comment: (source.tsdocComment as unknown) as DocComment,
  });
}

function resolveInterfaceMembers(
  entry: ApiEntryPoint,
  apiInterface: ApiInterface,
  referencesCount: InterfaceReferencesCount
): AnyEntity[] {
  const members = resolveMembers(entry, apiInterface, referencesCount);
  const inheritedMembers = resolveInheritedMembers(
    entry,
    apiInterface,
    referencesCount
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
  referencesCount: InterfaceReferencesCount
) {
  return apiInterface.members.map((m) => {
    if (isPropertySignature(m)) {
      return resolvePropertySignature(entry, m, referencesCount);
    }

    if (isMethodSignature(m)) {
      return resolveMethodSignature(entry, m, referencesCount);
    }

    throw new Error(`Unsupported member: ${m.displayName}`);
  });
}

function resolveInheritedMembers(
  entry: ApiEntryPoint,
  apiInterface: ApiInterface,
  referencesCount: InterfaceReferencesCount
) {
  return apiInterface.extendsTypes
    .map((m) => {
      const typeName = extractTypeName(m.excerpt);
      const inheritedInterface = findApi(entry, typeName) as ApiInterface;
      return resolveInterfaceMembers(
        entry,
        inheritedInterface,
        referencesCount
      );
    })
    .reduce((acc, curr) => acc.concat(curr), []);
}

function isPropertySignature(item: ApiItem): item is ApiPropertySignature {
  return item.kind === ApiItemKind.PropertySignature;
}

function resolvePropertySignature(
  entry: ApiEntryPoint,
  p: ApiPropertySignature,
  referencesCount: InterfaceReferencesCount
) {
  const typeExcerpt = p.propertyTypeExcerpt.spannedTokens[0];

  if (isRecordType(typeExcerpt)) {
    return buildEntityFromProperty(p);
  }

  if (isTypeAlias(typeExcerpt)) {
    return buildEntityFromPropertyAndResolveTypeAlias(entry, p);
  }

  if (isReference(typeExcerpt)) {
    return buildObjEntityFromProperty(entry, p, referencesCount);
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
  referencesCount: InterfaceReferencesCount
) {
  return resolveInterface(
    entry,
    findApi(entry, extractTypeName(p.propertyTypeExcerpt)) as ApiInterface,
    referencesCount,
    p
  );
}

function buildEntityFromPropertyAndResolveTypeAlias(
  entry: ApiEntryPoint,
  p: ApiPropertySignature
): Entity {
  const entity = buildEntityFromProperty(p);
  const alias = extractTypeName(p.propertyTypeExcerpt);
  const typeAlias = findApi(entry, alias) as ApiTypeAlias;
  const type = typeAlias.typeExcerpt.text;

  return {...entity, type};
}

function isMethodSignature(m: ApiItem): m is ApiMethodSignature {
  return m.kind === ApiItemKind.MethodSignature;
}

function resolveMethodSignature(
  entry: ApiEntryPoint,
  m: ApiMethodSignature,
  referencesCount: InterfaceReferencesCount
) {
  const params = m.parameters.map((p) =>
    resolveParameter(entry, p, referencesCount)
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
  referencesCount: InterfaceReferencesCount
) {
  const typeExcerpt = p.parameterTypeExcerpt.spannedTokens[0];

  if (isTypeAlias(typeExcerpt)) {
    return buildEntityFromParamAndResolveTypeAlias(entry, p);
  }

  if (isReference(typeExcerpt)) {
    return buildObjEntityFromParam(entry, p, referencesCount);
  }

  return buildParamEntity(p);
}

function buildEntityFromParamAndResolveTypeAlias(
  entry: ApiEntryPoint,
  p: Parameter
): Entity {
  const entity = buildParamEntity(p);
  const alias = extractTypeName(p.parameterTypeExcerpt);
  const typeAlias = findApi(entry, alias) as ApiTypeAlias;
  const type = typeAlias.typeExcerpt.text;

  return {...entity, type};
}

function buildObjEntityFromParam(
  entryPoint: ApiEntryPoint,
  p: Parameter,
  referencesCount: InterfaceReferencesCount
) {
  return resolveInterface(
    entryPoint,
    findApi(
      entryPoint,
      extractTypeName(p.parameterTypeExcerpt)
    ) as ApiInterface,
    referencesCount,
    p
  );
}

function extractTypeName(excerpt: Excerpt) {
  return excerpt.spannedTokens[0].text;
}
