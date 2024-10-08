// 3rd Party Libraries
export type {Unsubscribe, Middleware} from '@reduxjs/toolkit';
export type {Relay} from '@coveo/relay';

// Main App
export type {
  CaseAssistEngine,
  CaseAssistEngineOptions,
  CaseAssistEngineConfiguration,
} from './app/case-assist-engine/case-assist-engine.js';
export {buildCaseAssistEngine} from './app/case-assist-engine/case-assist-engine.js';

export type {CoreEngine, ExternalEngineOptions} from './app/engine.js';
export type {
  EngineConfiguration,
  AnalyticsConfiguration,
  AnalyticsRuntimeEnvironment,
} from './app/engine-configuration.js';
export type {LoggerOptions} from './app/logger.js';

export type {LogLevel} from './app/logger.js';
export type {NavigatorContext} from './app/navigatorContextProvider.js';

// Case Assist Action Loaders
export * from './features/case-input/case-input-actions-loader.js';
export * from './features/case-field/case-field-actions-loader.js';
export * from './features/document-suggestion/document-suggestion-actions-loader.js';
export * from './features/case-assist/case-assist-analytics-actions-loader.js';
export * from './features/analytics/generic-analytics-actions-loader.js';

// Controllers
export type {
  Controller,
  Subscribable,
} from './controllers/controller/headless-controller.js';
export {buildController} from './controllers/controller/headless-controller.js';

export type {
  CaseInputState,
  CaseInput,
  CaseInputOptions,
  CaseInputProps,
  UpdateFetchOptions,
} from './controllers/case-input/headless-case-input.js';
export {buildCaseInput} from './controllers/case-input/headless-case-input.js';

export type {
  CaseFieldState,
  CaseField,
  CaseFieldOptions,
  CaseFieldProps,
  UpdateCaseFieldFetchOptions,
} from './controllers/case-field/headless-case-field.js';
export {buildCaseField} from './controllers/case-field/headless-case-field.js';

export type {CaseFieldSuggestion} from './features/case-field/case-field-state.js';

export type {
  Quickview,
  QuickviewOptions,
  QuickviewProps,
  QuickviewState,
} from './controllers/core/quickview/headless-core-quickview.js';

export type {
  CaseAssistQuickviewState,
  CaseAssistQuickview,
  CaseAssistQuickviewOptions,
  CaseAssistQuickviewProps,
} from './controllers/quickview/case-assist-headless-quickview.js';
export {buildCaseAssistQuickview as buildQuickview} from './controllers/quickview/case-assist-headless-quickview.js';

export type {Result} from './api/search/search/result.js';
export type {Raw} from './api/search/search/raw.js';
export type {HighlightKeyword} from './utils/highlight.js';

export type {DocumentSuggestionResponse} from './api/service/case-assist/get-document-suggestions/get-document-suggestions-response.js';

export {
  getOrganizationEndpoint,
  getAnalyticsNextApiBaseUrl,
} from './api/platform-client.js';

export type {
  DocumentSuggestionList,
  DocumentSuggestionListState,
} from './controllers/document-suggestion-list/headless-document-suggestion-list.js';
export {buildDocumentSuggestionList} from './controllers/document-suggestion-list/headless-document-suggestion-list.js';

export {buildCaseAssistInteractiveResult as buildInteractiveResult} from './controllers/document-suggestion-list/case-assist-headless-interactive-result.js';

export {buildDocumentSuggestionList as buildDocumentSuggestion} from './controllers/document-suggestion-list/headless-document-suggestion-list.js';

export type {
  InteractiveResultCore,
  InteractiveResultCoreOptions,
  InteractiveResultCoreProps,
  CaseAssistInteractiveResult,
  CaseAssistInteractiveResultOptions,
  CaseAssistInteractiveResultProps,
} from './controllers/document-suggestion-list/case-assist-headless-interactive-result.js';

// Features
export {ResultTemplatesHelpers} from './features/result-templates/result-templates-helpers.js';
