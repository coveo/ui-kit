import type {
  InferHydratedState,
  InferStaticState,
  NavigatorContext,
} from '@coveo/headless/ssr-commerce';
import type {
  listingEngineDefinition,
  searchEngineDefinition,
} from '../lib/engine-definition';

/** Static state fetched on the server, per page type. */
type SearchStaticState = InferStaticState<typeof searchEngineDefinition>;
type ListingStaticState = InferStaticState<typeof listingEngineDefinition>;

/** Static state for either supported page type. */
export type AppStaticState = SearchStaticState | ListingStaticState;

/**
 * Hydrated controllers available on the client, derived from the engine
 * definitions. The listing page omits the search box; every other concern is
 * shared, so callers narrow with `'searchBox' in controllers`.
 */
type SearchControllers = InferHydratedState<
  typeof searchEngineDefinition
>['controllers'];
type ListingControllers = InferHydratedState<
  typeof listingEngineDefinition
>['controllers'];
export type AppControllers = SearchControllers | ListingControllers;

type PageType = 'search' | 'listing';

/**
 * The SSR payload the server injects for the client to hydrate from. It is
 * discriminated by `type`, so narrowing on `type` also narrows `staticState`
 * to the matching page.
 */
export type SsrState =
  | {
      type: 'search';
      staticState: SearchStaticState;
      navigatorContext: NavigatorContext;
    }
  | {
      type: 'listing';
      staticState: ListingStaticState;
      navigatorContext: NavigatorContext;
    };

declare global {
  interface Window {
    __SSR_STATE__?: SsrState;
  }
}
