import {HeadlessState} from '../../../state';
import {getQParam, getSortCriteriaParam} from '../search-request';

export interface SearchRequest {
  q: string;
  sortCriteria: string;
}

/** The search request parameters. For a full description, refer to {@link https://docs.coveo.com/en/13/cloud-v2-api-reference/search-api#operation/searchUsingPost}*/
export const searchRequestParams = (state: HeadlessState): SearchRequest => {
  return {
    ...getQParam(state),
    ...getSortCriteriaParam(state),
  };
};
