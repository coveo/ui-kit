import {ApiEntryPoint, ApiFunction} from '@microsoft/api-extractor-model';
import {findApi} from '../api-finder.js';
import {
  resolveCodeSamplePaths,
  SamplePaths,
  CodeSampleInfo,
} from '../code-sample-resolver.js';
import {FuncEntity, ObjEntity} from '../entity.js';
import {resolveFunction} from '../function-resolver.js';
import {extractTypesFromConfiguration} from './configuration-type-extractor.js';
import {resolveInitializer} from './initializer-resolver.js';

export interface ControllerConfiguration {
  initializer: string;
  samplePaths: SamplePaths;
  utils?: string[];
}

export interface Controller {
  initializer: FuncEntity;
  extractedTypes: ObjEntity[];
  utils: FuncEntity[];
  codeSampleInfo: CodeSampleInfo;
}

export function resolveController(
  entry: ApiEntryPoint,
  config: ControllerConfiguration
): Controller {
  const initializer = resolveInitializer(entry, config.initializer);
  const utils = (config.utils || []).map((util) => resolveUtility(entry, util));
  const extractedTypes = extractTypesFromConfiguration(initializer, utils);
  const codeSampleInfo = resolveCodeSamplePaths(config.samplePaths);

  return {initializer, extractedTypes, utils, codeSampleInfo};
}

function resolveUtility(entry: ApiEntryPoint, name: string) {
  const fn = findApi(entry, name) as ApiFunction;
  return resolveFunction(entry, fn, []);
}
