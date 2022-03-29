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
  LargeQueryParam &
  DisjunctionQueryParam &
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
  ExcerptLength &
  ActionsHistoryParam;

// Change this list when changing the fields exposed by `FieldsToIncludeParam`
export const SearchDefaultFieldsToInclude: string[] = [
  'date',
  'author',
  'source',
  'language',
  'filetype',
  'parents',
  'ec_price',
  'ec_name',
  'ec_description',
  'ec_brand',
  'ec_category',
  'ec_item_group_id',
  'ec_shortdesc',
  'ec_thumbnails',
  'ec_images',
  'ec_promo_price',
  'ec_in_stock',
  'ec_cogs',
  'ec_rating',
];
