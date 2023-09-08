import {polyfillCryptoNode} from './api/analytics/analytics-crypto-polyfill';

polyfillCryptoNode();

// 3rd Party Libraries
export type {Unsubscribe, Middleware} from '@reduxjs/toolkit';

// ⚠️ NOTE: All exported SSR types, APIs should be marked as `@internal` until MVP is complete
export type {
  ControllerDefinitionWithoutProps,
  ControllerDefinitionWithProps,
  ControllerDefinitionsMap,
  InferControllerFromDefinition,
  InferControllersMapFromDefinition,
  InferControllerSSRStateFromDefinition,
  InferControllerSSRStateMapFromDefinitions,
} from './app/ssr-engine/types/common';

export type {
  EngineDefinition,
  InferSSRState,
  InferCSRState,
} from './app/ssr-engine/types/core-engine';

export type {
  SearchEngineDefinition,
  SearchEngineDefinitionOptions,
} from './app/search-engine/search-engine.ssr';
export {defineSearchEngine} from './app/search-engine/search-engine.ssr';

export type {
  SearchBox,
  SearchBoxOptions,
  SearchBoxProps,
  SearchBoxState,
} from './controllers/search-box/headless-search-box.ssr';
export {defineSearchBox} from './controllers/search-box/headless-search-box.ssr';
export type {
  ResultList,
  ResultListOptions,
  ResultListProps,
  ResultListState,
} from './controllers/result-list/headless-result-list.ssr';
export {defineResultList} from './controllers/result-list/headless-result-list.ssr';

export type {
  SearchParameterManager,
  SearchParameterManagerInitialState,
  SearchParameterManagerBuildProps,
  SearchParameterManagerState,
} from './controllers/search-parameter-manager/headless-search-parameter-manager.ssr';
export {defineSearchParameterManager} from './controllers/search-parameter-manager/headless-search-parameter-manager.ssr';
