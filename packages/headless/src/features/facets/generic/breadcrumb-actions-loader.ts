import {PayloadAction} from '@reduxjs/toolkit';
import {SearchEngine} from '../../../app/search-engine/search-engine';
import {deselectAllFacets} from './facet-actions';

/**
 * The breadcrumb action creators.
 */
export interface BreadcrumbActionCreators {
  /**
   * Deselects active values across all facets.
   *
   * @returns A dispatchable action.
   */
  deselectAllFacets(): PayloadAction;
}

/**
 * Returns breadcrumb action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadBreadcrumbActions(
  engine: SearchEngine
): BreadcrumbActionCreators {
  engine.addReducers({});

  return {deselectAllFacets};
}
