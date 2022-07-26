// 3rd Party Libraries
export type {Unsubscribe, Middleware} from '@reduxjs/toolkit';
export type {Result} from './api/search/search/result';
export type {
  ResultTemplate,
  ResultTemplateCondition,
} from './features/result-templates/result-templates';
export {ResultTemplatesHelpers} from './features';

export type {ResultTemplatesManager} from './features/result-templates/result-templates-manager';
export {buildResultTemplatesManager} from './features/result-templates/result-templates-manager';

// Main App
export type {
  InsightEngine,
  InsightEngineOptions,
  InsightEngineConfiguration,
} from './app/insight-engine/insight-engine';
export {buildInsightEngine} from './app/insight-engine/insight-engine';

export type {CoreEngine, ExternalEngineOptions} from './app/engine';
export type {
  EngineConfiguration,
  AnalyticsConfiguration,
  AnalyticsRuntimeEnvironment,
} from './app/engine-configuration';
export type {LoggerOptions} from './app/logger';

export type {LogLevel} from './app/logger';

// Action loaders
export * from './features/insight-interface/insight-interface-actions-loader';
export * from './features/insight-search/insight-search-actions-loader';

// Controllers
export type {
  Controller,
  Subscribable,
} from './controllers/controller/headless-controller';
export {buildController} from './controllers/controller/headless-controller';

export type {
  DidYouMean,
  DidYouMeanState,
  QueryCorrection,
  WordCorrection,
} from './controllers/insight/did-you-mean/headless-insight-did-you-mean';
export {buildDidYouMean} from './controllers/insight/did-you-mean/headless-insight-did-you-mean';

export type {
  NumericFacetBreadcrumb,
  FacetBreadcrumb,
  DateFacetBreadcrumb,
  CategoryFacetBreadcrumb,
  StaticFilterBreadcrumb,
  Breadcrumb,
  BreadcrumbValue,
  BreadcrumbManagerState,
  BreadcrumbManager,
  DeselectableValue,
} from './controllers/insight/breadcrumb-manager/headless-insight-breadcrumb-manager';
export {buildBreadcrumbManager} from './controllers/insight/breadcrumb-manager/headless-insight-breadcrumb-manager';

export type {
  SearchParameterManagerProps,
  SearchParameterManagerInitialState,
  SearchParameterManagerState,
  SearchParameterManager,
  SearchParameters,
} from './controllers/insight/search-parameter-manager/headless-insight-search-parameter-manager';
export {buildSearchParameterManager} from './controllers/insight/search-parameter-manager/headless-insight-search-parameter-manager';

export type {
  InsightSearchBox,
  SearchBoxState,
} from './controllers/insight/search-box/headless-insight-search-box';
export {buildInsightSearchBox} from './controllers/insight/search-box/headless-insight-search-box';

export type {
  InsightResultListProps,
  InsightResultList,
  InsightResultListState,
} from './controllers/insight/result-list/headless-insight-result-list';
export {buildInsightResultList} from './controllers/insight/result-list/headless-insight-result-list';

export {buildInsightInteractiveResult} from './controllers/insight/result-list/headless-insight-interactive-result';

export type {InsightInterfaceState} from './features/insight-interface/insight-interface-state';

export type {InsightInterface} from './controllers/insight-interface/insight-interface';
export {buildInsightInterface} from './controllers/insight-interface/insight-interface';
