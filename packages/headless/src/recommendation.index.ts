import {
  getResultProperty as getResultPropertyAlias,
  fieldsMustBeDefined as fieldsMustBeDefinedAlias,
  fieldsMustNotBeDefined as fieldsMustNotBeDefinedAlias,
  fieldMustMatch as fieldMustMatchAlias,
  fieldMustNotMatch as fieldMustNotMatchAlias,
} from './features/result-templates/result-templates-helpers.js';

export type {Unsubscribe, Middleware} from '@reduxjs/toolkit';

export type {
  RecommendationEngine,
  RecommendationEngineOptions,
  RecommendationEngineConfiguration,
} from './app/recommendation-engine/recommendation-engine.js';
export {
  buildRecommendationEngine,
  getSampleRecommendationEngineConfiguration,
} from './app/recommendation-engine/recommendation-engine.js';

export type {CoreEngine, ExternalEngineOptions} from './app/engine.js';
export type {
  EngineConfiguration,
  AnalyticsConfiguration,
  AnalyticsRuntimeEnvironment,
} from './app/engine-configuration.js';
export type {LoggerOptions} from './app/logger.js';
export type {LogLevel} from './app/logger.js';

// Actions
export * from './features/configuration/configuration-actions-loader.js';
export * from './features/configuration/search-configuration-actions-loader.js';
export * from './features/advanced-search-queries/advanced-search-queries-actions-loader.js';
export * from './features/context/context-actions-loader.js';
export * from './features/dictionary-field-context/dictionary-field-context-actions-loader.js';
export * from './features/fields/fields-actions-loader.js';
export * from './features/pipeline/pipeline-actions-loader.js';
export * from './features/search-hub/search-hub-actions-loader.js';
export * from './features/debug/debug-actions-loader.js';
export * from './features/recommendation/recommendation-actions-loader.js';
export * from './features/recommendation/recommendation-click-analytics-actions-loader.js';
export * from './features/pagination/pagination-actions-loader.js';

// Controllers
export type {
  Controller,
  Subscribable,
} from './controllers/controller/headless-controller.js';
export {buildController} from './controllers/controller/headless-controller.js';

export type {
  RecommendationListOptions,
  RecommendationListProps,
  RecommendationListState,
  RecommendationList,
} from './controllers/recommendation/headless-recommendation.js';
export {buildRecommendationList} from './controllers/recommendation/headless-recommendation.js';

export type {
  RecommendationInteractiveResultOptions,
  RecommendationInteractiveResultProps,
  InteractiveResult,
} from './controllers/recommendation/result-list/headless-recommendation-interactive-result.js';
export {buildInteractiveResult} from './controllers/recommendation/result-list/headless-recommendation-interactive-result.js';

export type {
  Context,
  ContextState,
  ContextValue,
  ContextPayload,
} from './controllers/context/headless-context.js';
export {buildContext} from './controllers/recommendation/context/headless-recommendation-context.js';

export type {
  DictionaryFieldContext,
  DictionaryFieldContextState,
  DictionaryFieldContextPayload,
} from './controllers/dictionary-field-context/headless-dictionary-field-context.js';
export {buildDictionaryFieldContext} from './controllers/dictionary-field-context/headless-dictionary-field-context.js';

// Miscellaneous
export type {Result} from './api/search/search/result.js';
export type {HighlightKeyword} from './utils/highlight.js';
export type {Raw} from './api/search/search/raw.js';

// Features
export type {
  ResultTemplate,
  ResultTemplateCondition,
} from './features/result-templates/result-templates.js';
export type {ResultTemplatesManager} from './features/result-templates/result-templates-manager.js';
export {buildResultTemplatesManager} from './features/result-templates/result-templates-manager.js';

export namespace ResultTemplatesHelpers {
  export const getResultProperty = getResultPropertyAlias;
  export const fieldsMustBeDefined = fieldsMustBeDefinedAlias;
  export const fieldsMustNotBeDefined = fieldsMustNotBeDefinedAlias;
  export const fieldMustMatch = fieldMustMatchAlias;
  export const fieldMustNotMatch = fieldMustNotMatchAlias;
}

export {
  MinimumFieldsToInclude,
  DefaultFieldsToInclude,
  EcommerceDefaultFieldsToInclude,
} from './features/fields/fields-state.js';

export {getOrganizationEndpoints} from './api/platform-client.js';
export type {PlatformEnvironment} from './utils/url-utils.js';
