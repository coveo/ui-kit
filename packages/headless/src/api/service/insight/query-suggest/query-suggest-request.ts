import {
  ContextParam,
  LocaleParam,
  VisitorIDParam,
} from '../../../platform-service-params';
import {
  ActionsHistoryParam,
  AnalyticsParam,
  AuthenticationParam,
  QueryParam,
  TimezoneParam,
} from '../../../search/search-api-params';
import {InsightParam} from '../insight-params';

export type InsightQuerySuggestRequest = InsightParam &
  QueryParam &
  ContextParam &
  LocaleParam &
  TimezoneParam &
  ActionsHistoryParam &
  VisitorIDParam &
  AuthenticationParam &
  AnalyticsParam & {
    count: number;
  };
