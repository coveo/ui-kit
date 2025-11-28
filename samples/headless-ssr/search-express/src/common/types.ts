import type {InferStaticState} from '@coveo/headless/ssr-next';
import type {searchEngineDefinition} from '../lib/engine-definition';

/**
 * Inferred static state type from engine definition
 *
 * This type is automatically generated from your engine configuration,
 * ensuring that server and client always agree on the state structure.
 */
export type SearchStaticState = InferStaticState<typeof searchEngineDefinition>;

/**
 * Global window extensions for client-side hydration
 *
 * The server injects the static state into `window.__STATIC_STATE__`
 * which the client then uses to hydrate the search engine.
 */
declare global {
  interface Window {
    /**
     * Server-rendered static state injected for client hydration
     * Available after page load, contains search results and controller states
     */
    __STATIC_STATE__?: SearchStaticState;
  }
}
