import type {
  InferStaticState,
  NavigatorContext,
} from '@coveo/headless/ssr-commerce';
import type {
  listingEngineDefinition,
  searchEngineDefinition,
} from '../lib/engine-definition';

type SearchStaticState = InferStaticState<typeof searchEngineDefinition>;
type ListingStaticState = InferStaticState<typeof listingEngineDefinition>;

/** A static state for either supported page type. */
export type AppStaticState = SearchStaticState | ListingStaticState;

export type PageType = 'search' | 'listing';

/** The SSR payload the server injects for the client to hydrate from. */
export interface SsrState {
  type: PageType;
  staticState: AppStaticState;
  navigatorContext: NavigatorContext;
}

declare global {
  interface Window {
    __SSR_STATE__?: SsrState;
  }
}
