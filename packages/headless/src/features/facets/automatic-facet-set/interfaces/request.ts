import {FacetValue} from '../../../../product-listing.index';

export type AutomaticFacetRequest = {
  field: string;
  currentValues: FacetValue[];
};
