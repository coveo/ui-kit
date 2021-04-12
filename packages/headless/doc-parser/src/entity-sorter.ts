import {AnyEntity, FuncEntity, isFunctionEntity} from './entity';

export function sortEntities(entities: AnyEntity[]) {
  const [methods, attributes] = mapIntoGroups<
    AnyEntity,
    FuncEntity,
    Exclude<AnyEntity, FuncEntity>
  >(entities, (entity, addMethod, addAttribute) =>
    isFunctionEntity(entity) ? addMethod(entity) : addAttribute(entity)
  );

  const [optionalAttributes, mandatoryAttributes] = mapIntoGroups(
    attributes,
    (entity, addOptionalAttribute, addMandatoryAttribute) =>
      entity.isOptional
        ? addOptionalAttribute(entity)
        : addMandatoryAttribute(entity)
  );

  const sortedMandatoryAttributes = alphabeticallySortEntities(
    mandatoryAttributes
  );
  const sortedOptionalAttributes = alphabeticallySortEntities(
    optionalAttributes
  );
  const sortedMethods = alphabeticallySortEntities(methods);

  return [
    ...sortedMandatoryAttributes,
    ...sortedOptionalAttributes,
    ...sortedMethods,
  ];
}

function mapIntoGroups<T, A = T, B = T>(
  values: T[],
  predicate: (
    value: T,
    pushToFirstGroup: (v: A) => void,
    pushToSecondGroup: (v: B) => void
  ) => void
): [A[], B[]] {
  const firstGroup: A[] = [];
  const secondGroup: B[] = [];
  values.forEach((value) =>
    predicate(
      value,
      (v) => firstGroup.push(v),
      (v) => secondGroup.push(v)
    )
  );
  return [firstGroup, secondGroup];
}

function alphabeticallySortEntities<T extends AnyEntity>(entities: T[]) {
  return entities.sort((a, b) => a.name.localeCompare(b.name));
}
