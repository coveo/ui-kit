/**
 * The Coveo Headless Case Assist sub-package exposes exposes the engine, controllers, actions, and utility functions to build a case assist experience.
 *
 * @example
 * ```typescript
 * import { buildCaseInput, buildCaseAssistEngine } from '@coveo/headless/case-assist';
 *
 * const engine = buildCaseAssistEngine({
 *    configuration: ...
 * });
 *
 * const caseInput = buildCaseInput(engine);
 * ```
 * @module Case Assist
 */

export type {Relay} from '@coveo/relay';
// 3rd Party Libraries
export type {Middleware, Unsubscribe} from '@reduxjs/toolkit';
export {
  getAnalyticsNextApiBaseUrl,
  getOrganizationEndpoint,
} from './api/platform-client.js';
export type {Raw} from './api/search/search/raw.js';
export type {Result} from './api/search/search/result.js';
export type {DocumentSuggestionResponse} from './api/service/case-assist/get-document-suggestions/get-document-suggestions-response.js';
// Main App
export type {
  CaseAssistEngine,
  CaseAssistEngineConfiguration,
  CaseAssistEngineOptions,
} from './app/case-assist-engine/case-assist-engine.js';
export {buildCaseAssistEngine} from './app/case-assist-engine/case-assist-engine.js';
export type {CoreEngine, ExternalEngineOptions} from './app/engine.js';
export type {
  AnalyticsConfiguration,
  AnalyticsRuntimeEnvironment,
  EngineConfiguration,
} from './app/engine-configuration.js';
export type {LoggerOptions, LogLevel} from './app/logger.js';
export type {NavigatorContext} from './app/navigator-context-provider.js';
export type {
  CaseField,
  CaseFieldOptions,
  CaseFieldProps,
  CaseFieldState,
  UpdateCaseFieldFetchOptions,
} from './controllers/case-field/headless-case-field.js';
export {buildCaseField} from './controllers/case-field/headless-case-field.js';
export type {
  CaseInput,
  CaseInputOptions,
  CaseInputProps,
  CaseInputState,
  UpdateFetchOptions,
} from './controllers/case-input/headless-case-input.js';
export {buildCaseInput} from './controllers/case-input/headless-case-input.js';
// Controllers
export type {
  Controller,
  Subscribable,
} from './controllers/controller/headless-controller.js';
export {buildController} from './controllers/controller/headless-controller.js';
export type {
  Quickview,
  QuickviewOptions,
  QuickviewProps,
  QuickviewState,
} from './controllers/core/quickview/headless-core-quickview.js';
export type {
  CaseAssistInteractiveResult,
  CaseAssistInteractiveResultOptions,
  CaseAssistInteractiveResultProps,
  InteractiveResultCore,
  InteractiveResultCoreOptions,
  InteractiveResultCoreProps,
} from './controllers/document-suggestion-list/case-assist-headless-interactive-result.js';
export {buildCaseAssistInteractiveResult as buildInteractiveResult} from './controllers/document-suggestion-list/case-assist-headless-interactive-result.js';
export type {
  DocumentSuggestionList,
  DocumentSuggestionListState,
} from './controllers/document-suggestion-list/headless-document-suggestion-list.js';
export {
  buildDocumentSuggestionList,
  buildDocumentSuggestionList as buildDocumentSuggestion,
} from './controllers/document-suggestion-list/headless-document-suggestion-list.js';
export type {
  CaseAssistQuickview,
  CaseAssistQuickviewOptions,
  CaseAssistQuickviewProps,
  CaseAssistQuickviewState,
} from './controllers/quickview/case-assist-headless-quickview.js';
export {buildCaseAssistQuickview as buildQuickview} from './controllers/quickview/case-assist-headless-quickview.js';
export * from './features/analytics/generic-analytics-actions-loader.js';
export * from './features/case-assist/case-assist-analytics-actions-loader.js';
export * from './features/case-field/case-field-actions-loader.js';
export type {CaseFieldSuggestion} from './features/case-field/case-field-state.js';
// Case Assist Action Loaders
export * from './features/case-input/case-input-actions-loader.js';
export * from './features/document-suggestion/document-suggestion-actions-loader.js';
// Features
export {ResultTemplatesHelpers} from './features/result-templates/result-templates-helpers.js';
export type {HighlightKeyword} from './utils/highlight.js';
