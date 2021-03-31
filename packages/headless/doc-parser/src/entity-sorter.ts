import {
  AnyEntity,
  Entity,
  EntityWithTypeAlias,
  FuncEntity,
  ObjEntity,
} from './entity';

export function sortEntities(entities: AnyEntity[]) {
  const [methods, attributes] = divideIntoGroups(entities, (entity) =>
    entity.kind === 'function' ? SortGroup.First : SortGroup.Second
  ) as [FuncEntity[], (Entity | EntityWithTypeAlias | ObjEntity)[]];

  const [optionalAttributes, mandatoryAttributes] = divideIntoGroups(
    attributes,
    (entity) => (entity.isOptional ? SortGroup.First : SortGroup.Second)
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

enum SortGroup {
  First,
  Second,
}

function divideIntoGroups<T>(
  values: T[],
  predicate: (value: T) => SortGroup
): [T[], T[]] {
  const firstGroup: T[] = [];
  const secondGroup: T[] = [];
  values.forEach((value) =>
    predicate(value) === SortGroup.First
      ? firstGroup.push(value)
      : secondGroup.push(value)
  );
  return [firstGroup, secondGroup];
}

function alphabeticallySortEntities<T extends AnyEntity>(entities: T[]) {
  return entities.sort((a, b) => a.name.localeCompare(b.name));
}
