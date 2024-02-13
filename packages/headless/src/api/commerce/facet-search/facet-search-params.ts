import {
  ClientIdParam,
  ContextParam,
  CountryParam,
  CurrencyParam,
  FacetsParam,
  LanguageParam,
  PageParam,
  QueryParam,
  SortParam,
  TrackingIdParam,
} from '../commerce-api-params';

export interface FacetQueryParam {
  facetQuery: string;
}

export interface FacetIdParam {
  facetId: string;
}

export interface SearchContextParam {
  searchContext?: SearchContextParams;
}

type SearchContextParams = TrackingIdParam &
  LanguageParam &
  CountryParam &
  CurrencyParam &
  ClientIdParam &
  ContextParam &
  FacetsParam &
  PageParam &
  SortParam &
  QueryParam;
