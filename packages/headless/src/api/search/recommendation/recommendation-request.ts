import {
  BaseParam,
  ContextParam,
  DictionaryFieldContextParam,
  LocaleParam,
  NumberOfResultsParam,
  VisitorIDParam,
} from '../../platform-service-params.js';
import {
  ActionsHistoryParam,
  AdvancedQueryParam,
  AnalyticsParam,
  AuthenticationParam,
  ConstantQueryParam,
  FieldsToIncludeParam,
  PipelineParam,
  RecommendationParam,
  ReferrerParam,
  SearchHubParam,
  TabParam,
  TimezoneParam,
} from '../search-api-params.js';

export type RecommendationRequest = BaseParam &
  RecommendationParam &
  SearchHubParam &
  PipelineParam &
  ContextParam &
  DictionaryFieldContextParam &
  FieldsToIncludeParam &
  AdvancedQueryParam &
  ConstantQueryParam &
  ActionsHistoryParam &
  TabParam &
  ReferrerParam &
  LocaleParam &
  TimezoneParam &
  VisitorIDParam &
  AnalyticsParam &
  AuthenticationParam &
  NumberOfResultsParam;
