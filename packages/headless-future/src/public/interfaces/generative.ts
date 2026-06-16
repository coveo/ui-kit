import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {
  KIND,
  STATE_ID,
  ENGINE,
  SOURCE_ENGINE,
  THUNK_FACTORIES,
  THUNKS,
  BUILDER_REGISTRY,
} from '@/src/core/interface/utils/symbols.js';
import type {Interface} from '@/src/core/interface/utils/interface-types.js';
import {generateId} from '@/src/core/interface/utils/id-generator.js';
import {loadGenerative} from '@/src/core/interface/generative/generative-loader.js';
import type {
  ControllerBuilder,
  GenerativeInterfaceOptions,
} from '@/src/core/interface/generative/generative-types.js';

export interface BuilderRegistry {
  commerceSearchControllers: ControllerBuilder[];
  searchControllers: ControllerBuilder[];
}

export type GenerativeInterface = Interface<'generative'> & {
  readonly [BUILDER_REGISTRY]: BuilderRegistry;
  readonly [SOURCE_ENGINE]: Engine;
};

export interface BuildGenerativeInterfaceOptions {
  engine: Engine;
  options: GenerativeInterfaceOptions;
  id?: string;
}

export function buildGenerativeInterface(
  opts: BuildGenerativeInterfaceOptions
): GenerativeInterface {
  const fullEngine = getFullEngine(opts.engine);
  const interfaceId = opts.id ?? generateId();

  const {commerceSearchControllers, searchControllers} = opts.options;
  if (!commerceSearchControllers?.length && !searchControllers?.length) {
    throw new Error(
      'buildGenerativeInterface requires at least one use-case with controller builders.'
    );
  }

  loadGenerative(fullEngine, interfaceId);

  const builderRegistry: BuilderRegistry = {
    commerceSearchControllers: commerceSearchControllers ?? [],
    searchControllers: searchControllers ?? [],
  };

  return Object.freeze({
    [KIND]: 'interface' as const,
    [STATE_ID]: interfaceId,
    [ENGINE]: fullEngine,
    [SOURCE_ENGINE]: opts.engine,
    [BUILDER_REGISTRY]: builderRegistry,
    [THUNK_FACTORIES]: {conversation: []},
    [THUNKS]: {conversation: []},
  });
}
