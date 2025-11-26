import type {BreadcrumbManager, BreadcrumbManagerState} from '@coveo/headless';
import {vi} from 'vitest';

export const defaultState = {
  facetBreadcrumbs: [],
  categoryFacetBreadcrumbs: [],
  numericFacetBreadcrumbs: [],
  dateFacetBreadcrumbs: [],
  staticFilterBreadcrumbs: [],
  hasBreadcrumbs: false,
  automaticFacetBreadcrumbs: [],
} satisfies BreadcrumbManagerState;

export const defaultImplementation = {
  subscribe: (subscribedFunction: () => void) => {
    subscribedFunction();
    return vi.fn();
  },
  state: defaultState,
  deselectAll: vi.fn(),
  deselectBreadcrumb: vi.fn(),
} satisfies BreadcrumbManager;

export const buildFakeBreadcrumbManager = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<BreadcrumbManager>;
  state?: Partial<BreadcrumbManagerState>;
}> = {}): BreadcrumbManager =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...{state: {...defaultState, ...(state || {})}},
  }) as BreadcrumbManager;
