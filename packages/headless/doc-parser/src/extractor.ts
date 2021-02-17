import {AnyEntity, ObjEntity} from './entity';
import {buildEntity} from './entity-builder';

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
    .forEach((entity) => extract(entity, extraction, ++level));
}

function extract(entity: ObjEntity, extraction: Extraction, level: number) {
  const maxDepth = 2;
  const {members} = entity;

  if (!members.length) {
    return;
  }

  if (level === maxDepth) {
    const typeHeading = {...buildTypeEntity(entity), members};
    extraction.types.push(typeHeading);
    processObjectEntities([typeHeading], extraction, 0);

    return;
  }

  processObjectEntities(members, extraction, level);
}

function buildTypeEntity(entity: ObjEntity) {
  const type = buildEntity({
    name: entity.type,
    type: entity.type,
    isOptional: false,
    comment: undefined,
  });

  return type;
}

export function isObjectEntity(entity: unknown): entity is ObjEntity {
  if (typeof entity !== 'object') {
    return false;
  }

  return !!entity && 'members' in entity;
}
