import type {NumericFacet} from '@coveo/headless';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

const defaultState = {
  enabled: true,
  facetId: 'numericFacet',
  hasActiveValues: false,
  values: [],
  isLoading: false,
  sortCriterion: 'ascending',
} satisfies NumericFacet['state'];

export const defaultImplementation = {
  subscribe: genericSubscribe,
  deselectAll: vi.fn(),
  isSortedBy: vi.fn(),
  isValueSelected: vi.fn(),
  sortBy: vi.fn(),
  toggleSelect: vi.fn(),
  toggleSingleSelect: vi.fn(),
  enable: vi.fn(),
  disable: vi.fn(),
  state: defaultState,
} satisfies NumericFacet;

export const buildFakeNumericFacet = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<NumericFacet>;
  state?: Partial<NumericFacet['state']>;
}> = {}): NumericFacet => {
  const properState = state ? state : defaultState;
  return {
    ...implementation,
    state: properState,
  } as NumericFacet;
};
