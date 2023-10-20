import {FacetValueState} from '../../../../../product-listing.index';
import {
  BaseFacetRequest,
  CurrentValues,
  Type,
} from '../../../../facets/facet-api/request';

export interface CommerceCategoryFacetValueRequest {
  state: FacetValueState;
  value: string;
  children: CommerceCategoryFacetValueRequest[];
}

export interface CommerceCategoryFacetRequest
  extends Pick<BaseFacetRequest, 'facetId' | 'field' | 'numberOfValues'>,
    CurrentValues<CommerceCategoryFacetValueRequest>,
    Type<'hierarchical'> {}
