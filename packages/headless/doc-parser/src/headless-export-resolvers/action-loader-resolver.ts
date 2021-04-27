import {ApiEntryPoint} from '@microsoft/api-extractor-model';
import {FuncEntity} from '../entity';
import {resolveInitializer} from './initializer-resolver';

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
  return {initializer};
}
