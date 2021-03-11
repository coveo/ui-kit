import {
  ApiEntryPoint,
  ApiFunction,
  ApiItem,
  ApiItemKind,
} from '@microsoft/api-extractor-model';
import {findApi} from './api-finder';
import {FuncEntity, ObjEntity} from './entity';
import {resolveFunction} from './function-resolver';
import {
  resolveCodeSamplePaths,
  SamplePaths,
  CodeSampleInfo,
} from './code-sample-resolver';
import {extractControllerTypes} from './controller-type-extractor';

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
  const initializer = resolveControllerInitializer(entry, config.initializer);
  const utils = (config.utils || []).map((util) => resolveUtility(entry, util));
  const extractedTypes = extractControllerTypes(initializer, utils);
  const codeSampleInfo = resolveCodeSamplePaths(config.samplePaths);

  return {initializer, extractedTypes, utils, codeSampleInfo};
}

function resolveControllerInitializer(entry: ApiEntryPoint, name: string) {
  const fn = findApi(entry, name);

  if (!isFunction(fn)) {
    throw new Error(
      `controller initializer "${name}" must be a function. Instead found: ${fn.kind}`
    );
  }

  return resolveFunction(entry, fn, [0]);
}

function resolveUtility(entry: ApiEntryPoint, name: string) {
  const fn = findApi(entry, name) as ApiFunction;
  return resolveFunction(entry, fn, []);
}

function isFunction(item: ApiItem): item is ApiFunction {
  return item.kind === ApiItemKind.Function;
}
