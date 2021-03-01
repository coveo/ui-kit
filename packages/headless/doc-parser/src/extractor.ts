import {AnyEntity, isFunctionEntity, isObjectEntity, ObjEntity} from './entity';
import {buildEntity, buildObjEntity} from './entity-builder';
import {InterfaceReferencesCount} from './interface-resolver';

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

export function extractTypes(
  headingEntities: AnyEntity[],
  referencesCount: InterfaceReferencesCount
): Extraction {
  const extraction: Extraction = {
    types: [],
  };

  processObjectEntities(
    headingEntities,
    extraction,
    Level.Heading,
    referencesCount
  );
  processFunctionEntities(headingEntities, extraction, referencesCount);

  return extraction;
}

function processObjectEntities(
  entities: AnyEntity[],
  extraction: Extraction,
  level: Level,
  referencesCount: InterfaceReferencesCount
) {
  entities
    .filter(isObjectEntity)
    .forEach((entity) =>
      extract(entity, extraction, level + 1, referencesCount)
    );
}

function processFunctionEntities(
  entities: AnyEntity[],
  extraction: Extraction,
  referencesCount: InterfaceReferencesCount
) {
  entities.filter(isFunctionEntity).forEach((func) => {
    const {params, returnType} = func;
    const entities = isString(returnType) ? params : [...params, returnType];

    processObjectEntities(entities, extraction, Level.Key, referencesCount);
  });
}

function extract(
  entity: ObjEntity,
  extraction: Extraction,
  level: Level,
  referencesCount: InterfaceReferencesCount
) {
  const {members} = entity;

  if (!members.length) {
    return;
  }

  if (
    !entity.isTypeExtracted &&
    (level === Level.Type || referencesCount[entity.typeName] > 1)
  ) {
    const typeHeading = buildTypeEntity(entity, members);
    extraction.types.push(typeHeading);

    entity.isTypeExtracted = true;
    entity.members = [];

    processObjectEntities(
      [typeHeading],
      extraction,
      Level.Heading,
      referencesCount
    );
    return;
  }

  processObjectEntities(members, extraction, level, referencesCount);
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
