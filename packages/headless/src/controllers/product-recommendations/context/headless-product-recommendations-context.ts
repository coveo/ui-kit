import {ProductRecommendationEngine} from '../../../app/product-recommendation-engine/product-recommendation-engine';
import {
  ContextPayload,
  ContextValue,
} from '../../../features/context/context-state';
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
export function buildContext(engine: ProductRecommendationEngine): Context {
  return buildCoreContext(engine);
}
