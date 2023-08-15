import {polyfillCryptoNode} from './api/analytics/analytics-crypto-polyfill';

polyfillCryptoNode();

// 3rd Party Libraries
export type {Unsubscribe, Middleware} from '@reduxjs/toolkit';

// ⚠️ NOTE: All exported SSR types, APIs should be marked as `@internal` until MVP is complete
export {mapObject} from './utils/utils';

export type {
  ControllerDefinitionWithoutProps,
  ControllerDefinitionWithProps,
  ControllerDefinitionsMap,
  InferControllerFromDefinition,
  InferControllersMapFromDefinition,
  InferControllerSSRStateFromDefinition,
  InferControllerSSRStateMapFromDefinitions,
} from './app/ssr-engine/types/common';

export type {SearchEngineDefinitionOptions} from './app/ssr-engine/types/search-engine';

export type {
  EngineDefinition,
  InferSSRState,
  InferCSRState,
} from './app/ssr-engine/types/core-engine';

export type {
  ResultList,
  ResultListOptions,
  ResultListProps,
  ResultListState,
} from './controllers/ssr/result-list/headless-ssr-result-list';

export {defineResultList} from './controllers/ssr/result-list/headless-ssr-result-list';

export {defineSearchEngine} from './app/ssr-engine/ssr-engine';
