import type {PayloadAction} from '@reduxjs/toolkit';
import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {
  deselectAllBreadcrumbs,
  deselectAllNonBreadcrumbs,
} from './breadcrumb-actions.js';

/**
 * The breadcrumb action creators.
 *
 * @group Actions
 * @category Breadcrumb
 */
export interface BreadcrumbActionCreators {
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
 *
 * @group Actions
 * @category Breadcrumb
 */
export function loadBreadcrumbActions(
  engine: SearchEngine
): BreadcrumbActionCreators {
  engine.addReducers({});

  return {
    deselectAllBreadcrumbs,
    deselectAllNonBreadcrumbs,
  };
}
