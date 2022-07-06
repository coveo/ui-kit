// 3rd Party Libraries
export type {Unsubscribe, Middleware} from '@reduxjs/toolkit';

export type {Result} from './api/search/search/result';
export type {
  ResultTemplate,
  ResultTemplateCondition,
} from './features/result-templates/result-templates';
export {ResultTemplatesHelpers} from './features';

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

export type {InsightInterfaceState} from './features/insight-interface/insight-interface-state';
export type {InsightInterface} from './controllers/insight-interface/insight-interface';
export {buildInsightInterface} from './controllers/insight-interface/insight-interface';
export {buildInsightSearchBox} from './controllers/insight/search-box/headless-insight-search-box';

export type {
  InsightResultListProps,
  InsightResultList,
  InsightResultListState,
} from './controllers/insight/result-list/headless-insight-result-list';
export {buildInsightResultList} from './controllers/insight/result-list/headless-insight-result-list';

export {buildInsightInteractiveResult} from './controllers/insight/result-list/headless-insight-interactive-result';
