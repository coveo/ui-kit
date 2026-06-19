import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {
  KIND,
  STATE_ID,
  ENGINE,
  SOURCE_ENGINE,
  THUNK_FACTORIES,
  THUNKS,
} from '@/src/core/interface/utils/symbols.js';
import type {Interface} from '@/src/core/interface/utils/interface-types.js';
import {generateId} from '@/src/core/interface/utils/id-generator.js';
import {loadGenerative} from '@/src/core/interface/generative/generative-loader.js';

export type GenerativeInterface = Interface<'generative'> & {
  readonly [SOURCE_ENGINE]: Engine;
};

export interface BuildGenerativeInterfaceOptions {
  engine: Engine;
  id?: string;
}

export function buildGenerativeInterface(
  options: BuildGenerativeInterfaceOptions
): GenerativeInterface {
  const fullEngine = getFullEngine(options.engine);
  const interfaceId = options.id ?? generateId();

  loadGenerative(fullEngine, interfaceId);

  return Object.freeze({
    [KIND]: 'interface' as const,
    [STATE_ID]: interfaceId,
    [ENGINE]: fullEngine,
    [SOURCE_ENGINE]: options.engine,
    [THUNK_FACTORIES]: {conversation: []},
    [THUNKS]: {conversation: []},
  });
}
