/**
 * @packageDocumentation
 * @module case-assist
 */
import {polyfillCryptoNode} from './api/analytics/analytics-crypto-polyfill';

polyfillCryptoNode();
// 3rd Party Libraries
export type {Unsubscribe, Middleware} from '@reduxjs/toolkit';
export type {Relay} from '@coveo/relay';

// Main App
export type {
  CaseAssistEngine,
  CaseAssistEngineOptions,
  CaseAssistEngineConfiguration,
} from './app/case-assist-engine/case-assist-engine';
export {buildCaseAssistEngine} from './app/case-assist-engine/case-assist-engine';

export type {CoreEngine, ExternalEngineOptions} from './app/engine';
export type {
  EngineConfiguration,
  AnalyticsConfiguration,
  AnalyticsRuntimeEnvironment,
} from './app/engine-configuration';
export type {LoggerOptions} from './app/logger';

export type {LogLevel} from './app/logger';
export type {NavigatorContext} from './app/navigatorContextProvider';

// Case Assist Action Loaders
export * from './features/case-input/case-input-actions-loader';
export * from './features/case-field/case-field-actions-loader';
export * from './features/document-suggestion/document-suggestion-actions-loader';
export * from './features/case-assist/case-assist-analytics-actions-loader';
export * from './features/analytics/generic-analytics-actions-loader';

// Controllers
export type {
  Controller,
  Subscribable,
} from './controllers/controller/headless-controller';
export {buildController} from './controllers/controller/headless-controller';

export type {
  CaseInputState,
  CaseInput,
  CaseInputOptions,
  CaseInputProps,
  UpdateFetchOptions,
} from './controllers/case-input/headless-case-input';
export {buildCaseInput} from './controllers/case-input/headless-case-input';

export type {
  CaseFieldState,
  CaseField,
  CaseFieldOptions,
  CaseFieldProps,
  UpdateCaseFieldFetchOptions,
} from './controllers/case-field/headless-case-field';
export {buildCaseField} from './controllers/case-field/headless-case-field';

export type {CaseFieldSuggestion} from './features/case-field/case-field-state';

export type {
  Quickview,
  QuickviewOptions,
  QuickviewProps,
  QuickviewState,
} from './controllers/core/quickview/headless-core-quickview';

export type {
  CaseAssistQuickviewState,
  CaseAssistQuickview,
  CaseAssistQuickviewOptions,
  CaseAssistQuickviewProps,
} from './controllers/quickview/case-assist-headless-quickview';
export {buildCaseAssistQuickview as buildQuickview} from './controllers/quickview/case-assist-headless-quickview';
export {buildCaseAssistQuickview} from './controllers/quickview/case-assist-headless-quickview';

export type {Result} from './api/search/search/result';
export type {Raw} from './api/search/search/raw';
export type {HighlightKeyword} from './utils/highlight';

export type {DocumentSuggestionResponse} from './api/service/case-assist/get-document-suggestions/get-document-suggestions-response';

export type {
  DocumentSuggestionList,
  DocumentSuggestionListState,
} from './controllers/document-suggestion-list/headless-document-suggestion-list';
export {buildDocumentSuggestionList} from './controllers/document-suggestion-list/headless-document-suggestion-list';

export {buildCaseAssistInteractiveResult as buildInteractiveResult} from './controllers/document-suggestion-list/case-assist-headless-interactive-result';

export {buildDocumentSuggestionList as buildDocumentSuggestion} from './controllers/document-suggestion-list/headless-document-suggestion-list';

export type {
  InteractiveResultCore,
  InteractiveResultCoreOptions,
  InteractiveResultCoreProps,
  CaseAssistInteractiveResult,
  CaseAssistInteractiveResultOptions,
  CaseAssistInteractiveResultProps,
} from './controllers/document-suggestion-list/case-assist-headless-interactive-result';
export {buildCaseAssistInteractiveResult} from './controllers/document-suggestion-list/case-assist-headless-interactive-result';

// Features
export {ResultTemplatesHelpers} from './features/result-templates/result-templates-helpers';
