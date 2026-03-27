import type {CommerceEngine} from '../commerce-engine/commerce-engine.js';
import type {CoreEngine} from '../engine.js';
import {engineMarkerKey} from '../engine-marker.js';
import type {SearchEngine} from '../search-engine/search-engine.js';
import type {FrankensteinEngine} from './frankenstein-engine.js';

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

function isFrankensteinEngine(engine: object): engine is FrankensteinEngine {
  return (
    engineMarkerKey in engine &&
    (engine as Record<symbol, unknown>)[engineMarkerKey] === 'frankenstein'
  );
}

/**
 * Accepts a `SearchEngine` or `FrankensteinEngine` and returns a `SearchEngine`.
 * If a `FrankensteinEngine` is provided, its internal search sub-engine is extracted.
 *
 * @internal
 */
export function ensureSearchEngine(
  engine: SearchEngine | FrankensteinEngine
): SearchEngine {
  if (isFrankensteinEngine(engine)) {
    return getSearchEngine(engine);
  }
  return engine;
}

/**
 * Accepts a `CommerceEngine` or `FrankensteinEngine` and returns a `CommerceEngine`.
 * If a `FrankensteinEngine` is provided, its internal commerce sub-engine is extracted.
 *
 * @internal
 */
export function ensureCommerceEngine(
  engine: CommerceEngine | FrankensteinEngine
): CommerceEngine {
  if (isFrankensteinEngine(engine)) {
    return getCommerceEngine(engine);
  }
  return engine;
}

/**
 * Accepts a `CoreEngine` or `FrankensteinEngine` and returns a `CoreEngine`.
 * If a `FrankensteinEngine` is provided, its internal search sub-engine is extracted
 * (which extends `CoreEngine`).
 *
 * @internal
 */
export function ensureCoreEngine(
  engine: CoreEngine | FrankensteinEngine
): CoreEngine {
  if (isFrankensteinEngine(engine)) {
    return getSearchEngine(engine);
  }
  return engine;
}
