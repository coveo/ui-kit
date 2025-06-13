import {
  BreadcrumbManager,
  BreadcrumbManagerState,
} from '@coveo/headless/commerce';
import {vi} from 'vitest';

export const defaultState = {
  facetBreadcrumbs: [
    {
      facetId: 'brand',
      facetDisplayName: 'Brand',
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
  ],
  hasBreadcrumbs: true,
} satisfies BreadcrumbManagerState;

export const defaultImplementation = {
  subscribe: (subscribedFunction: () => void) => {
    subscribedFunction();
  },
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
    ...(state && {state: {...defaultState, ...state}}),
  }) as BreadcrumbManager;
