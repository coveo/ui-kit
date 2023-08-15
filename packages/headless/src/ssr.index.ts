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
  InferSSRState,
  InferCSRState,
} from './app/ssr-engine/types/core-engine';

export {defineSearchEngine} from './app/ssr-engine/ssr-engine';

export type {
  SearchBox,
  SearchBoxOptions,
  SearchBoxProps,
  SearchBoxState,
} from './controllers/ssr/search-box/headless-ssr-search-box';
export {defineSearchBox} from './controllers/ssr/search-box/headless-ssr-search-box';
export type {
  ResultList,
  ResultListOptions,
  ResultListProps,
  ResultListState,
} from './controllers/ssr/result-list/headless-ssr-result-list';
export {defineResultList} from './controllers/ssr/result-list/headless-ssr-result-list';
