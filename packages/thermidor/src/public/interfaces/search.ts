import {Engine, getFullEngine} from '@/src/internal/engine/index.js';
import {generateId} from '@/src/internal/utils/index.js';
import type {SearchInterface} from '@/src/internal/utils/index.js';
import {SearchInterfaceImpl} from '@/src/internal/interfaces/index.js';

export type {SearchInterface} from '@/src/internal/utils/index.js';

export interface BuildSearchInterfaceOptions {
  engine: Engine;
  id?: string;
}

export function buildSearchInterface(
  options: BuildSearchInterfaceOptions
): SearchInterface {
  const fullEngine = getFullEngine(options.engine);
  const interfaceId = options.id ?? generateId();

  return new SearchInterfaceImpl(fullEngine, interfaceId);
}
