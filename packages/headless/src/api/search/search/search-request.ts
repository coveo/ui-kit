import {
  AdvancedQueryParam,
  BaseParam,
  ConstantQueryParam,
  ContextParam,
  EnableDidYouMeanParam,
  EnableQuerySyntaxParam,
  FacetOptionsParam,
  FacetsParam,
  FieldsToIncludeParam,
  FirstResultParam,
  NumberOfResultsParam,
  PipelineParam,
  QueryParam,
  SearchHubParam,
  SortCriteriaParam,
  VisitorIDParam,
  DebugParam,
  LocaleParam,
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
  LocaleParam;
