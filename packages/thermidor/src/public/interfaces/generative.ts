import {createAsyncThunk} from '@reduxjs/toolkit';
import {
  Engine,
  getFullEngine,
  type FullEngine,
} from '@/src/core/interface/engine/engine.js';
import {
  KIND,
  TYPE,
  STATE_ID,
  ENGINE,
  SOURCE_ENGINE,
  FACADE_RESOLVERS,
} from '@/src/core/interface/utils/symbols.js';
import type {Interface} from '@/src/core/interface/utils/interface-types.js';
import {generateId} from '@/src/core/interface/utils/id-generator.js';
import {loadGenerative} from '@/src/core/interface/generative/generative-loader.js';

export interface GenerativeInterface extends Interface<'generative'> {
  readonly [SOURCE_ENGINE]: Engine;
}

export interface BuildGenerativeInterfaceOptions {
  engine: Engine;
  id?: string;
}

const noopThunk = createAsyncThunk<void, {engine: FullEngine}>(
  'generative/noop',
  async () => {}
);

export function buildGenerativeInterface(
  options: BuildGenerativeInterfaceOptions
): GenerativeInterface {
  const fullEngine = getFullEngine(options.engine);
  const interfaceId = options.id ?? generateId();

  loadGenerative(fullEngine, interfaceId);

  return Object.freeze({
    [KIND]: 'interface' as const,
    [TYPE]: 'generative' as const,
    [STATE_ID]: interfaceId,
    [ENGINE]: fullEngine,
    [SOURCE_ENGINE]: options.engine,
    [FACADE_RESOLVERS]: {
      conversation: () => noopThunk,
    },
  });
}
