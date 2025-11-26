import type {AutomaticFacet, AutomaticFacetState} from '@coveo/headless';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

export const defaultState = {
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
} satisfies AutomaticFacetState;

export const defaultImplementation = {
  subscribe: genericSubscribe,
  state: defaultState,
  toggleSelect: vi.fn(),
  deselectAll: vi.fn(),
} satisfies AutomaticFacet;

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
