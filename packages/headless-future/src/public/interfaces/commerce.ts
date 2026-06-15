import {createAsyncThunk} from '@reduxjs/toolkit';
import {
  Engine,
  getFullEngine,
  type FullEngine,
} from '@/src/core/interface/engine/engine.js';
import {
  KIND,
  STATE_ID,
  ENGINE,
  THUNK_FACTORIES,
  THUNKS,
} from '@/src/core/interface/utils/symbols.js';
import type {
  Interface,
  Operations,
  EndpointThunkFactory,
  EndpointStateScope,
} from '@/src/core/interface/utils/interface-types.js';
import {generateId} from '@/src/core/interface/utils/id-generator.js';

export interface BuildCommerceInterfaceOptions {
  engine: Engine;
  id?: string;
}

const createCommerceSearchThunk: EndpointThunkFactory = (_engine, scope) => {
  return createAsyncThunk<void, {engine: FullEngine}>(
    `${scope.composedInterfaceId ?? scope.interfaceId}/commerceSearch/execute`,
    async () => {
      /* TODO: implement commerce search endpoint */
    }
  );
};

const createCommerceSuggestionsThunk: EndpointThunkFactory = (
  _engine,
  scope
) => {
  return createAsyncThunk<void, {engine: FullEngine}>(
    `${scope.composedInterfaceId ?? scope.interfaceId}/commerceSuggestions/execute`,
    async () => {
      /* TODO: implement commerce suggestions endpoint */
    }
  );
};

export function buildCommerceInterface(
  options: BuildCommerceInterfaceOptions
): Interface<'commerce'> {
  const fullEngine = getFullEngine(options.engine);
  const interfaceId = options.id ?? generateId();
  const scope: EndpointStateScope = {interfaceId};

  const factories: Record<Operations['commerce'], EndpointThunkFactory[]> = {
    search: [createCommerceSearchThunk],
    suggestions: [createCommerceSuggestionsThunk],
  };

  return Object.freeze({
    [KIND]: 'interface' as const,
    [STATE_ID]: interfaceId,
    [ENGINE]: fullEngine,
    [THUNK_FACTORIES]: factories,
    [THUNKS]: {
      search: factories.search.map((factory) => factory(fullEngine, scope)),
      suggestions: factories.suggestions.map((factory) =>
        factory(fullEngine, scope)
      ),
    },
  });
}
