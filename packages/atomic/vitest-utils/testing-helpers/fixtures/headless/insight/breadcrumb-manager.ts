import type {
  BreadcrumbManager as InsightBreadcrumbManager,
  BreadcrumbManagerState as InsightBreadcrumbManagerState,
} from '@coveo/headless/insight';
import {vi} from 'vitest';

export const defaultState = {
  facetBreadcrumbs: [],
  categoryFacetBreadcrumbs: [],
  numericFacetBreadcrumbs: [],
  dateFacetBreadcrumbs: [],
  staticFilterBreadcrumbs: [],
  hasBreadcrumbs: false,
  automaticFacetBreadcrumbs: [],
} satisfies InsightBreadcrumbManagerState;

export const defaultImplementation = {
  subscribe: (subscribedFunction: () => void) => {
    subscribedFunction();
    return vi.fn();
  },
  state: defaultState,
  deselectAll: vi.fn(),
  deselectBreadcrumb: vi.fn(),
} satisfies InsightBreadcrumbManager;

export const buildFakeBreadcrumbManager = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<InsightBreadcrumbManager>;
  state?: Partial<InsightBreadcrumbManagerState>;
}> = {}): InsightBreadcrumbManager =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...{state: {...defaultState, ...(state || {})}},
  }) as InsightBreadcrumbManager;
