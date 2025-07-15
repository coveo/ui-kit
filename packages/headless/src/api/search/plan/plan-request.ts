import type {
  BaseParam,
  ContextParam,
  LocaleParam,
} from '../../platform-service-params.js';
import type {
  AnalyticsParam,
  AuthenticationParam,
  PipelineParam,
  QueryParam,
  SearchHubParam,
  TimezoneParam,
} from '../search-api-params.js';

export type PlanRequest = BaseParam &
  SearchHubParam &
  ContextParam &
  QueryParam &
  PipelineParam &
  LocaleParam &
  TimezoneParam &
  AnalyticsParam &
  AuthenticationParam;
