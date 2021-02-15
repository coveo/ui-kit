import {ApiEntryPoint, ApiFunction} from '@microsoft/api-extractor-model';
import {findApi} from './api-finder';
import {FuncEntity} from './entity';
import {resolveFunction} from './function-resolver';
import {
  buildCodeSampleConfiguration,
  SamplePaths,
  Samples,
} from './code-sample-configuration';

export interface ControllerConfiguration {
  initializer: string;
  samplePaths: SamplePaths;
  utils?: string[];
}

interface Controller {
  initializer: FuncEntity;
  utils: FuncEntity[];
  samples: Samples;
}

export function resolveController(
  entry: ApiEntryPoint,
  config: ControllerConfiguration
): Controller {
  const initializer = resolveControllerFunction(entry, config.initializer);
  const utils = (config.utils || []).map((util) => resolveUtility(entry, util));
  const samples = buildCodeSampleConfiguration(config.samplePaths);

  return {initializer, utils, samples};
}

function resolveControllerFunction(entry: ApiEntryPoint, name: string) {
  const fn = findApi(entry, name) as ApiFunction;
  return resolveFunction(entry, fn, [0]);
}

function resolveUtility(entry: ApiEntryPoint, name: string) {
  const fn = findApi(entry, name) as ApiFunction;
  return resolveFunction(entry, fn, []);
}
