import {
  BaseParam,
  ContextParam,
  LocaleParam,
  VisitorIDParam,
} from '../../platform-service-params';
import {
  AnalyticsParam,
  PipelineParam,
  QueryParam,
  SearchHubParam,
  TimezoneParam,
} from '../search-api-params';

export type PlanRequest = BaseParam &
  SearchHubParam &
  ContextParam &
  QueryParam &
  PipelineParam &
  LocaleParam &
  TimezoneParam &
  VisitorIDParam &
  AnalyticsParam;
