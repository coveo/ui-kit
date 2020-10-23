import {
  AdvancedQueryParam,
  BaseParam,
  ConstantQueryParam,
  ContextParam,
  EnableDidYouMeanParam,
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
  FieldsToIncludeParam &
  PipelineParam &
  SearchHubParam &
  FacetOptionsParam &
  VisitorIDParam;
