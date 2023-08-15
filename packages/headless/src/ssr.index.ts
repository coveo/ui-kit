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

export type {
  ControllerDefinitionsMap,
  InferControllerFromDefinition,
  InferControllersMapFromDefinition,
  InferControllerInitialStateMapFromDefinitions,
} from './app/ssr-engine/types/common';

export type {SearchEngineDefinitionOptions} from './app/ssr-engine/types/search-engine';

export type {EngineDefinition} from './app/ssr-engine/types/core-engine';

export {defineSearchEngine} from './app/ssr-engine/ssr-engine';

export type {
  ResultList,
  ResultListOptions,
  ResultListProps,
  ResultListState,
} from './controllers/ssr/result-list/headless-ssr-result-list';
export {defineResultList} from './controllers/ssr/result-list/headless-ssr-result-list';

export {mapObject} from './utils/utils';
