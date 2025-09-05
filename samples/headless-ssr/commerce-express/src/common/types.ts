import type {InferStaticState} from '@coveo/headless/ssr-commerce-next';
import type {searchEngineDefinition} from '../lib/engine-definition';

export type SearchStaticState = InferStaticState<typeof searchEngineDefinition>;

declare global {
  interface Window {
    __STATIC_STATE__?: SearchStaticState;
  }
}
