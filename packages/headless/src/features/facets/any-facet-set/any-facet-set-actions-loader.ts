import {PayloadAction} from '@reduxjs/toolkit';
import {SearchEngine} from '../../..';
import {categoryFacetSet} from '../../../app/reducers';
import {disableFacet, enableFacet} from './any-facet-set-actions';

/**
 * The facet set action creators common to any facets.
 */
export interface AnyFacetSetActionCreators {
  /**
   * Enables a facet.
   *
   * @param facetId - The unique identifier of the facet (e.g., "1").
   * @returns A dispatchable action.
   */
  enableAnyFacet(facetId: string): PayloadAction<string>;
  /**
   * Disables a facet.
   *
   * @param facetId - The unique identifier of the facet (e.g., "1").
   * @returns A dispatchable action.
   */
  disableAnyFacet(facetId: string): PayloadAction<string>;
}

/**
 * Loads the `categoryFacetSet` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadAnyFacetSetActions(
  engine: SearchEngine
): AnyFacetSetActionCreators {
  engine.addReducers({categoryFacetSet});

  return {
    enableAnyFacet: enableFacet,
    disableAnyFacet: disableFacet,
  };
}
