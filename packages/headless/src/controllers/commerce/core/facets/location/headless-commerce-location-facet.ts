import type {
  BaseFacetValue,
  CoreCommerceFacet,
  CoreCommerceFacetState,
  FacetValueRequest,
  RegularFacetValue,
} from '../headless-core-commerce-facet.js';

/**
 * @deprecated Commerce location facets were an experimental feature that is now retired. Headless no longer
 * returns or handles location facets, so this type is not used anymore. It will be removed in the next major
 * version.
 */
export interface LocationFacetValue extends BaseFacetValue {
  value: string;
}

/**
 * @deprecated Commerce location facets were an experimental feature that is now retired. Headless no longer
 * returns or handles location facets, so this type is not used anymore. It will be removed in the next major
 * version.
 */
export type LocationFacetValueRequest = FacetValueRequest;

/**
 * @deprecated Commerce location facets were an experimental feature that is now retired. Headless no longer
 * returns or handles location facets, so this type is not used anymore. It will be removed in the next major
 * version.
 */
export type LocationFacetState = Omit<
  CoreCommerceFacetState<RegularFacetValue>,
  'type' | 'values'
> & {
  type: 'location';
  values: LocationFacetValue[];
};

/**
 * @deprecated Commerce location facets were an experimental feature that is now retired. The `FacetGenerator`
 * no longer creates `LocationFacet` sub-controllers, so this type is not used anymore. It will be removed in the
 * next major version.
 */
export type LocationFacet = Omit<
  CoreCommerceFacet<FacetValueRequest, RegularFacetValue>,
  'isValueExcluded' | 'isValueSelected' | 'toggleExclude' | 'toggleSingleExclude'
> & {
  isValueSelected(value: LocationFacetValue): boolean;
  state: LocationFacetState;
  type: 'location';
};
