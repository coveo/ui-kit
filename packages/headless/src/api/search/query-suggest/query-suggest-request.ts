import {
  BaseParam,
  ContextParam,
  LocaleParam,
  VisitorIDParam,
} from '../../platform-service-params.js';
import {
  ActionsHistoryParam,
  AnalyticsParam,
  AuthenticationParam,
  PipelineParam,
  QueryParam,
  SearchHubParam,
  TimezoneParam,
} from '../search-api-params.js';

export type QuerySuggestRequest = BaseParam &
  QueryParam &
  ContextParam &
  PipelineParam &
  SearchHubParam &
  LocaleParam &
  TimezoneParam &
  ActionsHistoryParam &
  VisitorIDParam &
  AuthenticationParam &
  AnalyticsParam & {
    count: number;
  };
