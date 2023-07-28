import {FacetValue} from '../../../../controllers/core/facets/facet/headless-core-facet';

export type AutomaticFacetRequest = {
  field: string;
  label: string;
  currentValues: FacetValue[];
};
