import {AnyEntity, isFunctionEntity} from './entity';
import {inverseTypeGuard} from './utils';

export function sortEntities(entities: AnyEntity[]) {
  const methods = entities.filter(isFunctionEntity);
  const attributes = entities.filter(inverseTypeGuard(isFunctionEntity));

  const optionalAttributes = attributes.filter(
    (attribute) => attribute.isOptional
  );
  const mandatoryAttributes = attributes.filter(
    (attribute) => !attribute.isOptional
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

function alphabeticallySortEntities<T extends AnyEntity>(entities: T[]) {
  return entities.sort((a, b) => a.name.localeCompare(b.name));
}
