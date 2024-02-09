import {BaseParam} from '../../platform-service-params';
import {baseRequest} from '../common/request';
import {
  FacetIdParam,
  FacetQueryParam,
  SearchContextParam,
} from './facet-search-params';

export type FacetSearchRequest = BaseParam &
  FacetQueryParam &
  FacetIdParam &
  SearchContextParam;

export const buildFacetSearchRequest = (req: FacetSearchRequest) => {
  return {
    ...baseRequest(req, 'facets'),
    requestParams: prepareRequestParams(req),
  };
};

const prepareRequestParams = (req: FacetSearchRequest) => {
  const {facetQuery, facetId, searchContext} = req;
  return {
    facetQuery,
    facetId,
    searchContext,
  };
};
