import type {AutomaticFacet, AutomaticFacetState} from '@coveo/headless';
import {vi} from 'vitest';

export const defaultState: AutomaticFacetState = {
  field: 'test_field',
  label: 'Test Field',
  values: [
    {
      value: 'value-1',
      numberOfResults: 15,
      state: 'idle',
    },
    {
      value: 'value-2',
      numberOfResults: 8,
      state: 'idle',
    },
  ],
};

export const defaultImplementation = {
  subscribe: (subscribedFunction: () => void) => {
    subscribedFunction();
  },
  state: defaultState,
  toggleSelect: vi.fn(),
  toggleSingleSelect: vi.fn(),
  isValueSelected: vi.fn(),
  deselectAll: vi.fn(),
};

export const buildFakeAutomaticFacet = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<AutomaticFacet>;
  state?: Partial<AutomaticFacetState>;
}> = {}): AutomaticFacet =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...{state: {...defaultState, ...(state || {})}},
  }) as AutomaticFacet;
