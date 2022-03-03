import {
  BaseParam,
  ContextParam,
  LocaleParam,
  VisitorIDParam,
} from '../../platform-service-params';
import {
  ActionsHistoryParam,
  AdvancedQueryParam,
  AnalyticsParam,
  ConstantQueryParam,
  FieldsToIncludeParam,
  PipelineParam,
  RecommendationParam,
  ReferrerParam,
  SearchHubParam,
  TabParam,
  TimezoneParam,
} from '../search-api-params';

export type RecommendationRequest = BaseParam &
  RecommendationParam &
  SearchHubParam &
  PipelineParam &
  ContextParam &
  FieldsToIncludeParam &
  AdvancedQueryParam &
  ConstantQueryParam &
  ActionsHistoryParam &
  TabParam &
  ReferrerParam &
  LocaleParam &
  TimezoneParam &
  VisitorIDParam &
  AnalyticsParam;
