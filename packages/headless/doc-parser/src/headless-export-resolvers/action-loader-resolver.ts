import {ApiEntryPoint} from '@microsoft/api-extractor-model';
import {FuncEntity, ObjEntity} from '../entity';
import {resolveInitializer} from './initializer-resolver';
import {extractTypesFromConfiguration} from './configuration-type-extractor';

export interface ActionLoaderConfiguration {
  initializer: string;
}

interface ActionLoader {
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
