import {
  BaseParam,
  ContextParam,
  LocaleParam,
} from '../../platform-service-params.js';
import {
  ActionsHistoryParam,
  AnalyticsParam,
  AuthenticationParam,
  PipelineParam,
  QueryParam,
  SearchHubParam,
  TabParam,
  TimezoneParam,
} from '../search-api-params.js';

export type QuerySuggestRequest = BaseParam &
  QueryParam &
  ContextParam &
  PipelineParam &
  SearchHubParam &
  TabParam &
  LocaleParam &
  TimezoneParam &
  ActionsHistoryParam &
  AuthenticationParam &
  AnalyticsParam & {
    count: number;
  };
