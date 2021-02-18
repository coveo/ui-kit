import {AnyEntity, isObjectEntity, ObjEntity} from './entity';
import {buildEntity, buildObjEntity} from './entity-builder';

interface Extraction {
  types: ObjEntity[];
}

export function extractTypes(headingEntities: AnyEntity[]): Extraction {
  const extraction: Extraction = {
    types: [],
  };

  processObjectEntities(headingEntities, extraction, 0);

  return extraction;
}

function processObjectEntities(
  entities: AnyEntity[],
  extraction: Extraction,
  level: number
) {
  entities
    .filter(isObjectEntity)
    .forEach((entity) => extract(entity, extraction, level + 1));
}

function extract(entity: ObjEntity, extraction: Extraction, level: number) {
  const maxDepth = 2;
  const {members} = entity;

  if (!members.length) {
    return;
  }

  if (level === maxDepth) {
    const typeHeading = buildTypeEntity(entity, members);
    extraction.types.push(typeHeading);
    entity.isTypeExtracted = true;

    processObjectEntities([typeHeading], extraction, 0);
    return;
  }

  processObjectEntities(members, extraction, level);
}

function buildTypeEntity(originalEntity: ObjEntity, members: AnyEntity[]) {
  const entity = buildEntity({
    name: originalEntity.typeName,
    type: '',
    isOptional: false,
    comment: undefined,
  });

  return buildObjEntity({entity, members, typeName: ''});
}
