import {ApiEntryPoint} from '@microsoft/api-extractor-model';
import {FuncEntity} from '../entity';
import {resolveInitializer} from './initializer-resolver';
import {extractControllerTypes} from './controller-type-extractor';

export interface ActionLoaderConfiguration {
  initializer: string;
}

interface ActionLoader {
  initializer: FuncEntity;
}

export function resolveActionLoader(
  entry: ApiEntryPoint,
  config: ActionLoaderConfiguration
): ActionLoader {
  const initializer = resolveInitializer(entry, config.initializer);
  extractControllerTypes(initializer, []);
  return {initializer};
}
