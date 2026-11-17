import {createAction, type PayloadAction} from '@reduxjs/toolkit';
import type {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine.js';
import type {LocationFacetValue} from '../../../../controllers/commerce/core/facets/location/headless-commerce-location-facet.js';
import {commerceFacetSetReducer as commerceFacetSet} from '../facet-set/facet-set-slice.js';

/**
 * @deprecated Commerce location facets were an experimental feature that is now retired. This type is not used
 * anymore. It will be removed in the next major version.
 */
export interface ToggleSelectLocationFacetValuePayload {
  /**
   * The unique identifier of the facet (for example, `"1"`).
   */
  facetId: string;

  /**
   * The target location facet value.
   */
  selection: LocationFacetValue;
}

/**
 * @deprecated Commerce location facets were an experimental feature that is now retired. The action creators
 * have no effect. This interface will be removed in the next major version.
 */
export interface LocationFacetActionCreators {
  /**
   * Has no effect: no reducer handles the returned action.
   *
   * @deprecated Commerce location facets were an experimental feature that is now retired. This action creator
   * will be removed in the next major version.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  toggleSelectLocationFacetValue(
    payload: ToggleSelectLocationFacetValuePayload
  ): PayloadAction<ToggleSelectLocationFacetValuePayload>;
}

const toggleSelectLocationFacetValue = createAction<ToggleSelectLocationFacetValuePayload>(
  'commerce/facets/locationFacet/toggleSelectValue'
);

/**
 * Returns the location facet action creators. The action creators have no effect. Like the other facet action
 * loaders, this function loads the commerce facet set reducer.
 *
 * @deprecated Commerce location facets were an experimental feature that is now retired. This function will be
 * removed in the next major version.
 *
 * @param engine - The commerce engine.
 * @returns An object holding the location facet action creators.
 */
export function loadLocationFacetActions(engine: CommerceEngine): LocationFacetActionCreators {
  engine.addReducers({commerceFacetSet});
  return {
    toggleSelectLocationFacetValue,
  };
}
