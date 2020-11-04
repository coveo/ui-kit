import {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response';
import {SearchResponseSuccess} from '../../api/search/search/search-response';

export interface SearchState {
  /** The search response. For a full description, refer to {@link https://docs.coveo.com/en/13/cloud-v2-api-reference/search-api#operation/searchUsingPost}*/
  response: SearchResponseSuccess;
  duration: number;
  queryExecuted: string;
  error: SearchAPIErrorWithStatusCode | null;
  automaticallyCorrected: boolean;
  isLoading: boolean;
  infiniteScrollingEnabled: boolean;
  pastResponses: SearchResponseSuccess[];
}

export function getSearchInitialState(): SearchState {
  return {
    response: {
      results: [],
      searchUid: '',
      totalCountFiltered: 0,
      facets: [],
      queryCorrections: [],
    },
    duration: 0,
    queryExecuted: '',
    error: null,
    automaticallyCorrected: false,
    isLoading: false,
    infiniteScrollingEnabled: false,
    pastResponses: [],
  };
}
