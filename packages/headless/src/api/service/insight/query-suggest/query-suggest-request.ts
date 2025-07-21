import type {
  ContextParam,
  LocaleParam,
} from '../../../platform-service-params.js';
import type {
  ActionsHistoryParam,
  AnalyticsParam,
  AuthenticationParam,
  QueryParam,
  TimezoneParam,
} from '../../../search/search-api-params.js';
import type {InsightParam} from '../insight-params.js';

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
