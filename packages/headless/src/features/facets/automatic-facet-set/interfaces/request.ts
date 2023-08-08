import {FacetValue} from '../../facet-set/interfaces/response';

export type AutomaticFacetRequest = {
  field: string;
  label: string;
  currentValues: FacetValue[];
};
