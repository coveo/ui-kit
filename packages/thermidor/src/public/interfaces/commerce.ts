import {Engine, getFullEngine} from '@/src/internal/engine/index.js';
import {generateId} from '@/src/internal/utils/index.js';
import type {CommerceInterface} from '@/src/internal/utils/index.js';
import {CommerceInterfaceImpl} from '@/src/internal/interfaces/index.js';

export type {CommerceInterface} from '@/src/internal/utils/index.js';

export interface BuildCommerceInterfaceOptions {
  engine: Engine;
  id?: string;
}

export function buildCommerceInterface(
  options: BuildCommerceInterfaceOptions
): CommerceInterface {
  const fullEngine = getFullEngine(options.engine);
  const interfaceId = options.id ?? generateId();

  return new CommerceInterfaceImpl(fullEngine, interfaceId);
}
