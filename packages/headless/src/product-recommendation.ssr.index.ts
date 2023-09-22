import {polyfillCryptoNode} from './api/analytics/analytics-crypto-polyfill';

polyfillCryptoNode();

export type {Unsubscribe, Middleware} from '@reduxjs/toolkit';

export type {
  ProductRecommendationEngine,
  ProductRecommendationEngineOptions,
  ProductRecommendationEngineConfiguration,
} from './app/product-recommendation-engine/product-recommendation-engine';
export type {
  ProductRecommendationEngineDefinition,
  ProductRecommendationEngineDefinitionOptions,
  SearchCompletedAction,
} from './app/product-recommendation-engine/product-recommendation-engine.ssr';
export {defineProductRecommendationEngine} from './app/product-recommendation-engine/product-recommendation-engine.ssr';
export {getSampleProductRecommendationEngineConfiguration} from './app/product-recommendation-engine/product-recommendation-engine';

export type {CoreEngine, ExternalEngineOptions} from './app/engine';
export type {
  EngineConfiguration,
  AnalyticsConfiguration,
  AnalyticsRuntimeEnvironment,
} from './app/engine-configuration';
export type {
  ControllerDefinitionWithoutProps,
  ControllerDefinitionWithProps,
  ControllerDefinitionsMap,
  InferControllerFromDefinition,
  InferControllersMapFromDefinition,
  InferControllerStaticStateFromController,
  InferControllerStaticStateMapFromControllers,
  InferControllerStaticStateMapFromDefinitions,
} from './app/ssr-engine/types/common';
export type {
  EngineDefinition,
  InferStaticState,
  InferHydratedState,
} from './app/ssr-engine/types/core-engine';
export type {LoggerOptions} from './app/logger';
export type {LogLevel} from './app/logger';

// Actions
export * from './features/configuration/configuration-actions-loader';
export * from './features/product-recommendations/product-recommendations-actions-loader';
export * from './features/product-recommendations/product-recommendations-click-analytics-actions-loader';
export * from './features/context/context-actions-loader';
export * from './features/dictionary-field-context/dictionary-field-context-actions-loader';
export * from './features/search-hub/search-hub-actions-loader';

// Controllers
export * from './controllers/product-recommendations/ssr.index';
