import {
  ApiEntryPoint,
  ApiInterface,
  ApiItem,
  ApiItemKind,
  ApiPropertySignature,
  ExcerptTokenKind,
} from '@microsoft/api-extractor-model';
import {findApi} from './api-finder';
import {Entity, ObjEntity} from './entity';

export function resolveInterfaceMembers(
  entry: ApiEntryPoint,
  apiInterface: ApiInterface
): (Entity | ObjEntity)[] {
  return apiInterface.members.filter(isPropertySignature).map((m) => {
    const {kind} = m.propertyTypeExcerpt.spannedTokens[0];
    const isReference = kind === ExcerptTokenKind.Reference;

    return isReference
      ? buildObjEntityFromProperty(entry, m)
      : buildEntityFromProperty(m);
  });
}

function isPropertySignature(item: ApiItem): item is ApiPropertySignature {
  return item.kind === ApiItemKind.PropertySignature;
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
