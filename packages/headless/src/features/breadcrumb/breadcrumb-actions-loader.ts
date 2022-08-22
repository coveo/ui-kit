import {PayloadAction} from '@reduxjs/toolkit';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {deselectAllFacets} from '../facets/generic/facet-actions';
import {
  deselectAllBreadcrumbs,
  deselectAllNonBreadcrumbs,
} from './breadcrumb-actions';

/**
 * The breadcrumb action creators.
 */
export interface BreadcrumbActionCreators {
  /**
   * Deselects active values across all facets.
   *
   * @deprecated - Please use `deselectAllBreadcrumbs` instead.
   *
   * @returns A dispatchable action.
   */
  deselectAllFacets(): PayloadAction;

  /**
   * Deselects active breadcrumb values across all facets and static filters.
   *
   * @returns A dispatchable action.
   */
  deselectAllBreadcrumbs(): PayloadAction;

  /**
   * Deselects active filters that are not listed in breadcrumbs across facets and static filters which have the option `hasBreadcrumbs` set to false.
   *
   * @returns A dispatchable action.
   */
  deselectAllNonBreadcrumbs(): PayloadAction;
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

  return {
    deselectAllFacets,
    deselectAllBreadcrumbs,
    deselectAllNonBreadcrumbs,
  };
}
