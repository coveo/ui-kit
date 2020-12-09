import {FacetSearchRequestOptions} from '../../../api/search/facet-search/base/base-facet-search-request';

export type FacetSearchOptions = {facetId: string} & Partial<
  FacetSearchRequestOptions
>;
