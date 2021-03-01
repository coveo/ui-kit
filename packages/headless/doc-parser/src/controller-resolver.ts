import {
  ApiEntryPoint,
  ApiFunction,
  ApiItem,
  ApiItemKind,
} from '@microsoft/api-extractor-model';
import {findApi} from './api-finder';
import {FuncEntity, isObjectEntity, ObjEntity} from './entity';
import {resolveFunction} from './function-resolver';
import {
  resolveCodeSamplePaths,
  SamplePaths,
  CodeSampleInfo,
} from './code-sample-resolver';
import {extractTypes} from './extractor';
import {InterfaceReferencesCount} from './interface-resolver';

export interface ControllerConfiguration {
  initializer: string;
  samplePaths: SamplePaths;
  utils?: string[];
}

interface Controller {
  initializer: FuncEntity;
  extractedTypes: ObjEntity[];
  utils: FuncEntity[];
  codeSampleInfo: CodeSampleInfo;
}

export function resolveController(
  entry: ApiEntryPoint,
  config: ControllerConfiguration
): Controller {
  const referencesCount: InterfaceReferencesCount = {};
  const initializer = resolveControllerInitializer(
    entry,
    config.initializer,
    referencesCount
  );
  const utils = (config.utils || []).map((util) =>
    resolveUtility(entry, util, referencesCount)
  );
  const extractedTypes = extractTypesFrom(initializer, utils, referencesCount);
  const codeSampleInfo = resolveCodeSamplePaths(config.samplePaths);

  return {initializer, extractedTypes, utils, codeSampleInfo};
}

function resolveControllerInitializer(
  entry: ApiEntryPoint,
  name: string,
  referencesCount: InterfaceReferencesCount
) {
  const fn = findApi(entry, name);

  if (!isFunction(fn)) {
    throw new Error(
      `controller initializer "${name}" must be a function. Instead found: ${fn.kind}`
    );
  }

  return resolveFunction(entry, fn, [0], referencesCount);
}

function resolveUtility(
  entry: ApiEntryPoint,
  name: string,
  referencesCount: InterfaceReferencesCount
) {
  const fn = findApi(entry, name) as ApiFunction;
  return resolveFunction(entry, fn, [], referencesCount);
}

function isFunction(item: ApiItem): item is ApiFunction {
  return item.kind === ApiItemKind.Function;
}

function extractTypesFrom(
  initializer: FuncEntity,
  utils: FuncEntity[],
  referencesCount: InterfaceReferencesCount
) {
  const instanceTypes = extractTypesFromInitializerInstance(
    initializer,
    referencesCount
  );
  const utilTypes = extractTypes(utils, referencesCount).types;
  const types = instanceTypes.concat(utilTypes);

  return removeDuplicates(types);
}

function extractTypesFromInitializerInstance(
  entity: FuncEntity,
  referencesCount: InterfaceReferencesCount
) {
  const {returnType} = entity;

  if (typeof returnType === 'string') {
    return [];
  }

  if (isObjectEntity(returnType)) {
    return extractTypes(returnType.members, referencesCount).types;
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
