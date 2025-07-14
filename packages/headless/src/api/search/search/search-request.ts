import type {
  BaseParam,
  ContextParam,
  DebugParam,
  DictionaryFieldContextParam,
  FoldingParam,
  LocaleParam,
  NumberOfResultsParam,
} from '../../platform-service-params.js';
import type {
  ActionsHistoryParam,
  AdvancedQueryParam,
  AnalyticsParam,
  AuthenticationParam,
  AutomaticFacetsParams,
  ConstantQueryParam,
  DisjunctionQueryParam,
  EnableDidYouMeanParam,
  EnableQuerySyntaxParam,
  ExcerptLength,
  FacetOptionsParam,
  FacetsParam,
  FieldsToIncludeParam,
  FirstResultParam,
  LargeQueryParam,
  PipelineParam,
  PipelineRuleParams,
  QueryCorrectionParam,
  QueryParam,
  ReferrerParam,
  SearchHubParam,
  SortCriteriaParam,
  TabParam,
  TimezoneParam,
} from '../search-api-params.js';

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
  QueryCorrectionParam &
  EnableQuerySyntaxParam &
  FieldsToIncludeParam &
  PipelineParam &
  SearchHubParam &
  FacetOptionsParam &
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
