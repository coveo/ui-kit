/**
 * The Coveo Headless Recommendation sub-package exposes exposes the engine, controllers, actions, and utility functions to build a recommendation experience.
 *
 * @example
 * ```typescript
 * import { buildRecommendationList, buildRecommendationEngine, getSampleRecommendationEngineConfiguration } from '@coveo/headless/recommendation';
 *
 * const engine = buildRecommendationEngine({
 *    configuration: getSampleRecommendationEngineConfiguration()
 * });
 *
 * const recommendationList = buildRecommendationList(engine);
 * ```
 * @module Recommendation
 */
import * as HighlightUtils from './utils/highlight.js';

export {HighlightUtils};

export type {Relay} from '@coveo/relay';
export type {Middleware, Unsubscribe} from '@reduxjs/toolkit';
export {
  getAnalyticsNextApiBaseUrl,
  getOrganizationEndpoint,
} from './api/platform-client.js';
export type {Raw} from './api/search/search/raw.js';
// Miscellaneous
export type {Result} from './api/search/search/result.js';
export type {CoreEngine, ExternalEngineOptions} from './app/engine.js';
export type {
  AnalyticsConfiguration,
  AnalyticsRuntimeEnvironment,
  EngineConfiguration,
} from './app/engine-configuration.js';
export type {LoggerOptions, LogLevel} from './app/logger.js';
export type {NavigatorContext} from './app/navigator-context-provider.js';
export type {
  RecommendationEngine,
  RecommendationEngineConfiguration,
  RecommendationEngineOptions,
} from './app/recommendation-engine/recommendation-engine.js';
export {
  buildRecommendationEngine,
  getSampleRecommendationEngineConfiguration,
} from './app/recommendation-engine/recommendation-engine.js';
export type {
  Context,
  ContextInitialState,
  ContextPayload,
  ContextProps,
  ContextState,
  ContextValue,
} from './controllers/context/headless-context.js';
export {buildContext} from './controllers/context/headless-context.js';
// Controllers
export type {
  Controller,
  Subscribable,
} from './controllers/controller/headless-controller.js';
export {buildController} from './controllers/controller/headless-controller.js';
export type {
  DictionaryFieldContext,
  DictionaryFieldContextPayload,
  DictionaryFieldContextState,
} from './controllers/dictionary-field-context/headless-dictionary-field-context.js';
export {buildDictionaryFieldContext} from './controllers/dictionary-field-context/headless-dictionary-field-context.js';
export type {
  RecommendationList,
  RecommendationListOptions,
  RecommendationListProps,
  RecommendationListState,
} from './controllers/recommendation/headless-recommendation.js';
export {buildRecommendationList} from './controllers/recommendation/headless-recommendation.js';
export type {
  InteractiveResult,
  InteractiveResultCore,
  InteractiveResultCoreOptions,
  InteractiveResultCoreProps,
  RecommendationInteractiveResultOptions,
  RecommendationInteractiveResultProps,
} from './controllers/recommendation/result-list/headless-recommendation-interactive-result.js';
export {buildInteractiveResult} from './controllers/recommendation/result-list/headless-recommendation-interactive-result.js';
export * from './features/advanced-search-queries/advanced-search-queries-actions-loader.js';
// Actions
export * from './features/configuration/configuration-actions-loader.js';
export * from './features/configuration/search-configuration-actions-loader.js';
export * from './features/context/context-actions-loader.js';
export * from './features/debug/debug-actions-loader.js';
export * from './features/dictionary-field-context/dictionary-field-context-actions-loader.js';
export * from './features/fields/fields-actions-loader.js';
export {
  DefaultFieldsToInclude,
  EcommerceDefaultFieldsToInclude,
  MinimumFieldsToInclude,
} from './features/fields/fields-state.js';
export * from './features/pagination/pagination-actions-loader.js';
export * from './features/pipeline/pipeline-actions-loader.js';
export * from './features/recommendation/recommendation-actions-loader.js';
export * from './features/recommendation/recommendation-click-analytics-actions-loader.js';
export {ResultTemplatesHelpers} from './features/result-templates/result-templates-helpers.js';

// Features
export type {
  ResultTemplate,
  ResultTemplateCondition,
  ResultTemplatesManager,
} from './features/result-templates/result-templates-manager.js';
export {buildResultTemplatesManager} from './features/result-templates/result-templates-manager.js';
export * from './features/search-hub/search-hub-actions-loader.js';
export type {HighlightKeyword} from './utils/highlight.js';

export type {PlatformEnvironment} from './utils/url-utils.js';
