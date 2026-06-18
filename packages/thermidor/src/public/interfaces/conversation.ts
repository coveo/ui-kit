import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
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
import {createSearchEndpointThunk} from '@/src/core/internal/api/search-endpoint/search-endpoint-thunk.js';
import {createQuerySuggestThunk} from '@/src/core/internal/api/query-suggest/query-suggest-thunk.js';

export interface BuildConversationInterfaceOptions {
  engine: Engine;
  id?: string;
}

export function buildConversationInterface(
  options: BuildConversationInterfaceOptions
): Interface<'conversation'> {
  const fullEngine = getFullEngine(options.engine);
  const interfaceId = options.id ?? generateId();
  const scope: EndpointStateScope = {interfaceId};

  const factories: Record<Operations['conversation'], EndpointThunkFactory[]> =
    {
      conversation: [],
      search: [createSearchEndpointThunk],
      suggestions: [createQuerySuggestThunk],
    };

  return Object.freeze({
    [KIND]: 'interface' as const,
    [STATE_ID]: interfaceId,
    [ENGINE]: fullEngine,
    [THUNK_FACTORIES]: factories,
    [THUNKS]: {
      conversation: [],
      search: factories.search.map((factory) => factory(fullEngine, scope)),
      suggestions: factories.suggestions.map((factory) =>
        factory(fullEngine, scope)
      ),
    },
  });
}
