import {ApiEntryPoint, ApiFunction} from '@microsoft/api-extractor-model';
import {findApi} from './api-finder';
import {FuncEntity} from './entity';
import {resolveFunction} from './function-resolver';
import {
  resolveCodeSamplePaths,
  SamplePaths,
  CodeSampleInfo,
} from './code-sample-resolver';

export interface ControllerConfiguration {
  initializer: string;
  samplePaths: SamplePaths;
  utils?: string[];
}

interface Controller {
  initializer: FuncEntity;
  utils: FuncEntity[];
  codeSampleInfo: CodeSampleInfo;
}

export function resolveController(
  entry: ApiEntryPoint,
  config: ControllerConfiguration
): Controller {
  const initializer = resolveControllerFunction(entry, config.initializer);
  const utils = (config.utils || []).map((util) => resolveUtility(entry, util));
  const codeSampleInfo = resolveCodeSamplePaths(config.samplePaths);

  return {initializer, utils, codeSampleInfo};
}

function resolveControllerFunction(entry: ApiEntryPoint, name: string) {
  const fn = findApi(entry, name) as ApiFunction;
  return resolveFunction(entry, fn, [0]);
}

function resolveUtility(entry: ApiEntryPoint, name: string) {
  const fn = findApi(entry, name) as ApiFunction;
  return resolveFunction(entry, fn, []);
}
