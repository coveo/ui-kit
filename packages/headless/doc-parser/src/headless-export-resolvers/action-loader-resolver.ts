import {ApiEntryPoint} from '@microsoft/api-extractor-model';
import {FuncEntity, ObjEntity} from '../entity.js';
import {extractTypesFromConfiguration} from './configuration-type-extractor.js';
import {resolveInitializer} from './initializer-resolver.js';

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
