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

export * from './controllers/index.ssr';
