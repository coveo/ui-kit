import {
  ContextPayload,
  ContextValue,
} from '../../../features/context/context-state';
import {ProductListingEngine} from '../../../app/product-listing-engine/product-listing-engine';
import {
  buildCoreContext,
  Context,
  ContextState,
} from '../../core/context/headless-core-context';

export type {Context, ContextState, ContextPayload, ContextValue};

/**
 * Creates a `Context` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `Context` controller instance.
 */
export function buildContext(engine: ProductListingEngine): Context {
  return buildCoreContext(engine);
}
