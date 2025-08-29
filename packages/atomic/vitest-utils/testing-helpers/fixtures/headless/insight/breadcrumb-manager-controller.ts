import type {BreadcrumbManager as InsightBreadcrumbManager} from '@coveo/headless/insight';
import {vi} from 'vitest';

export function buildFakeInsightBreadcrumbManager(
  config: Partial<InsightBreadcrumbManager> = {}
): InsightBreadcrumbManager {
  const fakeController: InsightBreadcrumbManager = {
    state: {
      hasBreadcrumbs: false,
      facetBreadcrumbs: [],
      categoryFacetBreadcrumbs: [],
      numericFacetBreadcrumbs: [],
      dateFacetBreadcrumbs: [],
      staticFilterBreadcrumbs: [],
      ...config.state,
    },
    deselectAll: vi.fn(),
    deselectBreadcrumb: vi.fn(),
    subscribe: vi.fn((listener) => {
      listener();
      return vi.fn();
    }),
    ...config,
  };

  return fakeController;
}
