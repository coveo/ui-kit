import {AnyFacetResponse} from '../../../../features/facets/generic/interfaces/generic-facet-response';

export type CommerceFacetType = 'regular';

export type CommerceFacetResponse = AnyFacetResponse & {
  type: CommerceFacetType;
  displayName: string;
  isFieldExpanded: boolean;
  numberOfResults: number;
  fromAutoSelect: boolean;
};
