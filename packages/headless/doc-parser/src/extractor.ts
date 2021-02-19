import {AnyEntity, isFunctionEntity, isObjectEntity, ObjEntity} from './entity';
import {buildEntity, buildObjEntity} from './entity-builder';

interface Extraction {
  types: ObjEntity[];
}

/**
 * The level at which the entity will be displayed in the documentation.
 *
 * Section
 *    Heading
 *        Key : Type
 *
 * @example
 *
 * Facet
 *    state
 *        canShowMoreValues : boolean
 */
enum Level {
  Section,
  Heading,
  Key,
  Type,
}

export function extractTypes(headingEntities: AnyEntity[]): Extraction {
  const extraction: Extraction = {
    types: [],
  };

  processObjectEntities(headingEntities, extraction, Level.Heading);
  processFunctionEntities(headingEntities, extraction);

  return extraction;
}

function processObjectEntities(
  entities: AnyEntity[],
  extraction: Extraction,
  level: Level
) {
  entities
    .filter(isObjectEntity)
    .forEach((entity) => extract(entity, extraction, level + 1));
}

function processFunctionEntities(
  entities: AnyEntity[],
  extraction: Extraction
) {
  entities.filter(isFunctionEntity).forEach((func) => {
    const {params, returnType} = func;
    const entities = isString(returnType) ? params : [...params, returnType];

    processObjectEntities(entities, extraction, Level.Key);
  });
}

function extract(entity: ObjEntity, extraction: Extraction, level: Level) {
  const {members} = entity;

  if (!members.length) {
    return;
  }

  if (level === Level.Type) {
    const typeHeading = buildTypeEntity(entity, members);
    extraction.types.push(typeHeading);

    entity.isTypeExtracted = true;
    entity.members = [];

    processObjectEntities([typeHeading], extraction, Level.Heading);
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

function isString(value: unknown): value is string {
  return typeof value === 'string';
}
