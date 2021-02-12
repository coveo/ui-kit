import {ApiEntryPoint, ApiFunction} from '@microsoft/api-extractor-model';
import {findApi} from './api-finder';
import {FuncEntity} from './entity';
import {resolveFunction} from './function-resolver';

interface Controller {
  initializer: FuncEntity;
}

export function resolveController(
  entryPoint: ApiEntryPoint,
  controllerName: string
): Controller {
  const controller = findApi(entryPoint, controllerName) as ApiFunction;
  const initializer = resolveControllerFunction(entryPoint, controller);

  return {initializer};
}

function resolveControllerFunction(entry: ApiEntryPoint, fn: ApiFunction) {
  return resolveFunction(entry, fn, [0]);
}
