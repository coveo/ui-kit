import {
  BaseParam,
  ContextParam,
  DebugParam,
  FoldingParam,
  LocaleParam,
  NumberOfResultsParam,
  VisitorIDParam,
} from '../../platform-service-params';
import {
  AdvancedQueryParam,
  ConstantQueryParam,
  EnableDidYouMeanParam,
  EnableQuerySyntaxParam,
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
  TimezoneParam;
