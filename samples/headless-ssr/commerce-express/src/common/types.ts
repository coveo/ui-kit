import type {InferStaticState} from '@coveo/headless/ssr-commerce-next';
import type {EngineDefinition} from './engine';

export type SearchStaticState = InferStaticState<EngineDefinition>;

declare global {
  interface Window {
    __STATIC_STATE__?: SearchStaticState;
  }
}
