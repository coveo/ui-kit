import type {
  CategoryFacet,
  DateFacet,
  FacetGenerator,
  FacetGeneratorState,
  NumericFacet,
  RegularFacet,
} from '@coveo/headless/commerce';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

export type AnyCommerceFacet =
  | RegularFacet
  | NumericFacet
  | CategoryFacet
  | DateFacet;

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
}> = {}): FacetGenerator =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...(state && {state: {...defaultState, ...state}}),
  }) as FacetGenerator;
