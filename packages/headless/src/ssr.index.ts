import {polyfillCryptoNode} from './api/analytics/analytics-crypto-polyfill';

polyfillCryptoNode();

// 3rd Party Libraries
export type {Unsubscribe, Middleware} from '@reduxjs/toolkit';

// ⚠️ NOTE: All exported SSR types, APIs should be marked as `@internal` until MVP is complete
export type {
  ControllerDefinitionWithoutProps,
  ControllerDefinitionWithProps,
} from './app/ssr-engine/types/common';
export type {
  InferInitialState,
  InferLiveState,
} from './app/ssr-engine/types/core-engine';

export {defineSearchEngine} from './app/ssr-engine/ssr-engine';

export type {
  SearchBox,
  SearchBoxOptions,
  SearchBoxProps,
  SearchBoxState,
  SearchBoxMethods,
} from './controllers/ssr/search-box/headless-ssr-search-box';
export {defineSearchBox} from './controllers/ssr/search-box/headless-ssr-search-box';
