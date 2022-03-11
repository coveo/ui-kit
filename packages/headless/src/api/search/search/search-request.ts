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
  AdvancedQueryParam,
  AnalyticsParam,
  ConstantQueryParam,
  EnableDidYouMeanParam,
  EnableQuerySyntaxParam,
  ExcerptLength,
  FacetOptionsParam,
  FacetsParam,
  FieldsToIncludeParam,
  FirstResultParam,
  PipelineParam,
  QueryParam,
  ReferrerParam,
  SearchHubParam,
  SortCriteriaParam,
  TabParam,
  TimezoneParam,
} from '../search-api-params';

export type SearchRequest = BaseParam &
  QueryParam &
  AdvancedQueryParam &
  ConstantQueryParam &
  NumberOfResultsParam &
  FirstResultParam &
  SortCriteriaParam &
  FacetsParam &
  ContextParam &
  DictionaryFieldContextParam &
  EnableDidYouMeanParam &
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
  ExcerptLength;
