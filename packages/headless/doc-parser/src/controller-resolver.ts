import {ApiEntryPoint, ApiFunction} from '@microsoft/api-extractor-model';
import {findApi} from './api-finder';
import {FuncEntity} from './entity';
import {resolveFunction} from './function-resolver';

interface ControllerConfiguration {
  initializer: string;
  utils?: string[];
}

interface Controller {
  initializer: FuncEntity;
  utils: FuncEntity[];
}

export function buildControllerConfiguration(
  config: ControllerConfiguration
): Required<ControllerConfiguration> {
  return {utils: [], ...config};
}

export function resolveController(
  entry: ApiEntryPoint,
  config: Required<ControllerConfiguration>
): Controller {
  const initializer = resolveControllerFunction(entry, config.initializer);
  const utils = config.utils.map((util) => resolveUtility(entry, util));
  return {initializer, utils};
}

function resolveControllerFunction(entry: ApiEntryPoint, name: string) {
  const fn = findApi(entry, name) as ApiFunction;
  return resolveFunction(entry, fn, [0]);
}

function resolveUtility(entry: ApiEntryPoint, name: string) {
  const fn = findApi(entry, name) as ApiFunction;
  return resolveFunction(entry, fn, []);
}
