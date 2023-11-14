import {BaseFacetRequest} from '../../../../facets/facet-api/request';
import {FacetValueRequest} from '../../../../facets/facet-set/interfaces/request';
import {FacetType} from '../../../../../api/commerce/product-listings/v2/facet';

export type CommerceFacetRequest = Pick<BaseFacetRequest, 'field' |'numberOfValues'> & {
  type: FacetType;
  // TODO(nico): Might need to narrow down FacetValueRequest type
  values: FacetValueRequest[];
};
