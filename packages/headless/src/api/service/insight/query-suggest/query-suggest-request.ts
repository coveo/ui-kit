import {ContextParam, LocaleParam} from '../../../platform-service-params.js';
import {
  ActionsHistoryParam,
  AnalyticsParam,
  AuthenticationParam,
  QueryParam,
  TimezoneParam,
} from '../../../search/search-api-params.js';
import {InsightParam} from '../insight-params.js';

export type InsightQuerySuggestRequest = InsightParam &
  QueryParam &
  ContextParam &
  LocaleParam &
  TimezoneParam &
  ActionsHistoryParam &
  AuthenticationParam &
  AnalyticsParam & {
    count: number;
  };
