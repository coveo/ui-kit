import type {BreadcrumbManager, BreadcrumbManagerState} from '@coveo/headless';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

export const buildFakeBreadcrumbManager = ({
  state = {},
  implementation = {},
}: {
  state?: Partial<BreadcrumbManagerState>;
  implementation?: Partial<BreadcrumbManager>;
} = {}): BreadcrumbManager => {
  const defaultState = {
    facetBreadcrumbs: [],
    categoryFacetBreadcrumbs: [],
    numericFacetBreadcrumbs: [],
    dateFacetBreadcrumbs: [],
    staticFilterBreadcrumbs: [],
    automaticFacetBreadcrumbs: [],
    hasBreadcrumbs: false,
    ...state,
  } satisfies BreadcrumbManagerState;

  return {
    subscribe: genericSubscribe,
    state: defaultState,
    deselectAll: vi.fn(),
    ...implementation,
  } as BreadcrumbManager;
};
