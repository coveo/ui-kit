import {FacetValue} from '../../../../product-listing.index';

export type AutomaticFacetRequest = {
  field: string;
  label: string;
  currentValues: FacetValue[];
};
