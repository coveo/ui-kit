import {SearchPageState} from '../../../state';
import {getQParam} from '../search-request';

export interface SearchRequest {
  q: string;
  numberOfResults: number;
  sortCriteria: string;
  firstResult: number;
}

/** The search request parameters. For a full description, refer to {@link https://docs.coveo.com/en/13/cloud-v2-api-reference/search-api#operation/searchUsingPost}*/
export const searchRequestParams = (state: SearchPageState): SearchRequest => {
  return {
    ...getQParam(state),
    numberOfResults: state.pagination.numberOfResults,
    sortCriteria: state.sortCriteria,
    firstResult: state.pagination.firstResult,
  };
};
