import {ApiEntryPoint} from '@microsoft/api-extractor-model';
import {FuncEntity, ObjEntity} from '../entity.js';
import {extractTypesFromConfiguration} from './configuration-type-extractor.js';
import {resolveEngineInitializer} from './initializer-resolver.js';

export interface EngineConfiguration {
  initializer: string;
}

export interface Engine {
  initializer: FuncEntity;
  extractedTypes: ObjEntity[];
}

export function resolveEngine(
  entry: ApiEntryPoint,
  config: EngineConfiguration
): Engine {
  const initializer = resolveEngineInitializer(entry, config.initializer);
  const extractedTypes = extractTypesFromConfiguration(initializer, []);
  return {initializer, extractedTypes};
}
