import {ApiEntryPoint} from '@microsoft/api-extractor-model';
import {FuncEntity, ObjEntity} from '../entity';
import {extractTypesFromConfiguration} from './configuration-type-extractor';
import {resolveInitializer} from './initializer-resolver';

export interface ActionLoaderConfiguration {
  initializer: string;
}

export interface ActionLoader {
  initializer: FuncEntity;
  extractedTypes: ObjEntity[];
}

export function resolveActionLoader(
  entry: ApiEntryPoint,
  config: ActionLoaderConfiguration
): ActionLoader {
  const initializer = resolveInitializer(entry, config.initializer);
  const extractedTypes = extractTypesFromConfiguration(initializer, []);
  return {initializer, extractedTypes};
}
