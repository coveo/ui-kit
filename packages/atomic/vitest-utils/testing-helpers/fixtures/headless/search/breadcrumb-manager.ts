import type {BreadcrumbManager, BreadcrumbManagerState} from '@coveo/headless';
import {vi} from 'vitest';

export const buildFakeBreadcrumbManager = ({
  state = {},
  implementation = {},
}: {
  state?: Partial<BreadcrumbManagerState>;
  implementation?: Partial<BreadcrumbManager>;
} = {}): BreadcrumbManager => {
  const defaultState: BreadcrumbManagerState = {
    facetBreadcrumbs: [],
    categoryFacetBreadcrumbs: [],
    numericFacetBreadcrumbs: [],
    dateFacetBreadcrumbs: [],
    staticFilterBreadcrumbs: [],
    automaticFacetBreadcrumbs: [],
    hasBreadcrumbs: false,
    ...state,
  };

  return {
    subscribe: vi.fn((callback) => {
      callback();
      return vi.fn();
    }),
    state: defaultState,
    deselectAll: vi.fn(),
    ...implementation,
  } as BreadcrumbManager;
};
