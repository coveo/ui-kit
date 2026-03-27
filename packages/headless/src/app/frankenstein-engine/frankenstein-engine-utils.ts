import type {CommerceEngine} from '../commerce-engine/commerce-engine.js';
import type {SearchEngine} from '../search-engine/search-engine.js';

/**
 * Symbol key used to store the internal search sub-engine on a FrankensteinEngine instance.
 * Internal-only; not exposed to consumers.
 *
 * @internal
 */
export const searchEngineKey: unique symbol = Symbol.for(
  'coveo-frankenstein-search-engine'
);

/**
 * Symbol key used to store the internal commerce sub-engine on a FrankensteinEngine instance.
 * Internal-only; not exposed to consumers.
 *
 * @internal
 */
export const commerceEngineKey: unique symbol = Symbol.for(
  'coveo-frankenstein-commerce-engine'
);

type HasSearchEngine = {readonly [searchEngineKey]: SearchEngine};
type HasCommerceEngine = {readonly [commerceEngineKey]: CommerceEngine};

/**
 * Retrieves the internal search sub-engine from a FrankensteinEngine.
 *
 * @internal
 */
export function getSearchEngine(engine: HasSearchEngine): SearchEngine {
  return engine[searchEngineKey];
}

/**
 * Retrieves the internal commerce sub-engine from a FrankensteinEngine.
 *
 * @internal
 */
export function getCommerceEngine(engine: HasCommerceEngine): CommerceEngine {
  return engine[commerceEngineKey];
}
