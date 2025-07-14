import type {
  FacetGenerator,
  FacetGeneratorState,
} from '@coveo/headless/commerce';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

export const defaultState = ['facet1', 'facet2'] satisfies FacetGeneratorState;

export const defaultImplementation = {
  subscribe: genericSubscribe,
  state: defaultState,
  deselectAll: vi.fn(),
  facets: [],
} satisfies FacetGenerator;

export const buildFakeFacetGenerator = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<FacetGenerator>;
  state?: Partial<FacetGeneratorState>;
}> = {}): FacetGenerator => {
  const properState = state ? state : defaultState;
  return {
    ...defaultImplementation,
    ...implementation,
    state: properState,
  } as FacetGenerator;
};
