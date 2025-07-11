import type {FacetValue} from '../../facet-set/interfaces/response.js';

export type AutomaticFacetRequest = {
  field: string;
  label: string;
  currentValues: FacetValue[];
};
