import {
  BaseParam,
  ContextParam,
  DebugParam,
  DictionaryFieldContextParam,
  FoldingParam,
  LocaleParam,
  NumberOfResultsParam,
  VisitorIDParam,
} from '../../platform-service-params';
import {
  ActionsHistoryParam,
  AdvancedQueryParam,
  AnalyticsParam,
  AuthenticationParam,
  ConstantQueryParam,
  DisjunctionQueryParam,
  EnableDidYouMeanParam,
  EnableQuerySyntaxParam,
  ExcerptLength,
  FacetOptionsParam,
  FacetsParam,
  FieldsToIncludeParam,
  FirstResultParam,
  AutomaticFacetsParams,
  LargeQueryParam,
  PipelineParam,
  QueryParam,
  ReferrerParam,
  SearchHubParam,
  SortCriteriaParam,
  TabParam,
  TimezoneParam,
  EnableFallbackSearchOnEmptyQueryResultsParam,
  PipelineRuleParams,
} from '../search-api-params';

export type SearchRequest = BaseParam &
  QueryParam &
  AdvancedQueryParam &
  ConstantQueryParam &
  LargeQueryParam &
  DisjunctionQueryParam &
  NumberOfResultsParam &
  FirstResultParam &
  SortCriteriaParam &
  FacetsParam &
  ContextParam &
  DictionaryFieldContextParam &
  EnableDidYouMeanParam &
  EnableFallbackSearchOnEmptyQueryResultsParam &
  EnableQuerySyntaxParam &
  FieldsToIncludeParam &
  PipelineParam &
  SearchHubParam &
  FacetOptionsParam &
  VisitorIDParam &
  DebugParam &
  LocaleParam &
  FoldingParam &
  TabParam &
  ReferrerParam &
  TimezoneParam &
  AnalyticsParam &
  ExcerptLength &
  ActionsHistoryParam &
  AuthenticationParam &
  AutomaticFacetsParams &
  PipelineRuleParams;
