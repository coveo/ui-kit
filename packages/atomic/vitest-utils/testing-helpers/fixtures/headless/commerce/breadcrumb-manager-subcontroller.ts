import type {
  BreadcrumbManager,
  BreadcrumbManagerState,
} from '@coveo/headless/commerce';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

export const defaultState = {
  facetBreadcrumbs: [
    {
      facetId: 'brand',
      facetDisplayName: 'Regular',
      field: 'brand',
      type: 'regular',
      values: [
        {
          value: {
            value: 'Gucci',
            numberOfResults: 1,
            state: 'selected',
          },
          deselect: vi.fn(),
        },
      ],
    },
    {
      facetId: 'hierarchical',
      facetDisplayName: 'Hierarchical',
      field: 'hierarchical',
      type: 'hierarchical',
      values: [
        {
          value: {
            value: 'Clothing',
            path: ['path1', 'path2', 'path3', 'path4'],
            numberOfResults: 1,
            state: 'selected',
          },
          deselect: vi.fn(),
        },
      ],
    },
    {
      facetId: 'numericalRange',
      facetDisplayName: 'Numerical Range',
      field: 'numericalRange',
      type: 'numericalRange',
      values: [
        {
          value: {
            start: '0',
            end: '100',
            numberOfResults: 1,
            state: 'selected',
            endInclusive: true,
            moreValuesAvailable: false,
            isSuggested: false,
            isAutoSelected: false,
          },
          deselect: vi.fn(),
        },
      ],
    },
    {
      facetId: 'dateRange',
      facetDisplayName: 'Date Range',
      field: 'dateRange',
      type: 'dateRange',
      values: [
        {
          value: {
            start: '2023-01-01T00:00:00Z',
            end: '2023-12-31T23:59:59Z',
            numberOfResults: 1,
            state: 'selected',
            endInclusive: true,
            moreValuesAvailable: false,
            isSuggested: false,
            isAutoSelected: false,
          },
          deselect: vi.fn(),
        },
      ],
    },
  ],
  hasBreadcrumbs: true,
} satisfies BreadcrumbManagerState;

export const defaultImplementation = {
  subscribe: genericSubscribe,
  state: defaultState,
  deselectAll: vi.fn(),
};

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
