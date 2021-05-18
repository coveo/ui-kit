import {FuncEntity, isObjectEntity, ObjEntity} from '../entity';
import {extractTypes} from '../extractor';

export function extractControllerTypes(
  initializer: FuncEntity,
  utils: FuncEntity[]
) {
  const initializerTypes = extractedTypesFromInitializer(initializer);
  const utilTypes = extractTypes(utils).types;
  const types = initializerTypes.concat(utilTypes);

  return removeDuplicates(types);
}

function extractedTypesFromInitializer(initializer: FuncEntity) {
  const propTypes = extractTypesFromInitializerProps(initializer);
  const instanceTypes = extractTypesFromInitializerInstance(initializer);

  return propTypes.concat(instanceTypes);
}

function extractTypesFromInitializerProps(initializer: FuncEntity) {
  const propsParameter = initializer.params[1];

  if (propsParameter && isObjectEntity(propsParameter)) {
    return extractTypes(propsParameter.members).types;
  }

  return [];
}

function extractTypesFromInitializerInstance(initializer: FuncEntity) {
  const {returnType} = initializer;

  if (isObjectEntity(returnType)) {
    return extractTypes(returnType.members).types;
  }

  return [];
}

function removeDuplicates(entities: ObjEntity[]) {
  const seenNames = new Set();

  return entities.filter((entity) => {
    const {name} = entity;

    if (seenNames.has(name)) {
      return false;
    }

    seenNames.add(name);
    return true;
  });
}
