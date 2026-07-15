import {Engine, getFullEngine} from '@/src/internal/engine/index.js';
import {generateId} from '@/src/internal/utils/index.js';
import type {GenerativeInterface} from '@/src/internal/utils/index.js';
import {GenerativeInterfaceImpl} from '@/src/internal/interfaces/index.js';

export type {GenerativeInterface} from '@/src/internal/utils/index.js';

export interface BuildGenerativeInterfaceOptions {
  engine: Engine;
  id?: string;
}

export function buildGenerativeInterface(
  options: BuildGenerativeInterfaceOptions
): GenerativeInterface {
  const fullEngine = getFullEngine(options.engine);
  const interfaceId = options.id ?? generateId();

  return new GenerativeInterfaceImpl(fullEngine, interfaceId);
}
