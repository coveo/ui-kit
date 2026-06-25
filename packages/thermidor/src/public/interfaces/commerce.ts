import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {
  KIND,
  TYPE,
  STATE_ID,
  ENGINE,
  FACADE_RESOLVERS,
} from '@/src/core/interface/utils/symbols.js';
import type {Interface} from '@/src/core/interface/utils/interface-types.js';
import {generateId} from '@/src/core/interface/utils/id-generator.js';
import {createCommerceSearchFacadeResolver} from '@/src/core/interface/api/commerce-search/commerce-search-facade.js';
import {createCommerceSuggestionsFacadeResolver} from '@/src/core/interface/api/commerce-query-suggest/commerce-query-suggest-facade.js';

export type CommerceInterface = Interface<'commerce'>;

export interface BuildCommerceInterfaceOptions {
  engine: Engine;
  id?: string;
}

export function buildCommerceInterface(
  options: BuildCommerceInterfaceOptions
): CommerceInterface {
  const fullEngine = getFullEngine(options.engine);
  const interfaceId = options.id ?? generateId();

  return Object.freeze({
    [KIND]: 'interface' as const,
    [TYPE]: 'commerce' as const,
    [STATE_ID]: interfaceId,
    [ENGINE]: fullEngine,
    [FACADE_RESOLVERS]: {
      search: createCommerceSearchFacadeResolver(fullEngine),
      suggestions: createCommerceSuggestionsFacadeResolver(fullEngine),
    },
  });
}
