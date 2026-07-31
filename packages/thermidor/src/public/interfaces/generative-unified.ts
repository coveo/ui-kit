import {Engine, getFullEngine} from '@/src/internal/engine/index.js';
import {generateId} from '@/src/internal/utils/index.js';
import type {GenerativeUnifiedInterface} from '@/src/internal/utils/index.js';
import {GenerativeUnifiedInterfaceImpl} from '@/src/internal/interfaces/index.js';

export type {GenerativeUnifiedInterface} from '@/src/internal/utils/index.js';

export interface BuildGenerativeUnifiedInterfaceOptions {
  engine: Engine;
  id?: string;
}

export function buildGenerativeUnifiedInterface(
  options: BuildGenerativeUnifiedInterfaceOptions
): GenerativeUnifiedInterface {
  const fullEngine = getFullEngine(options.engine);
  const interfaceId = options.id ?? generateId();

  return new GenerativeUnifiedInterfaceImpl(fullEngine, interfaceId);
}
