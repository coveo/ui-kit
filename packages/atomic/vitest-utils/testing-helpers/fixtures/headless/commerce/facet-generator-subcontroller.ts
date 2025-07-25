import type {
  FacetGenerator,
  FacetGeneratorState,
  RegularFacet,
  NumericFacet,
  CategoryFacet,
  DateFacet,
} from '@coveo/headless/commerce';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

export type AnyCommerceFacet =
  | RegularFacet
  | NumericFacet
  | CategoryFacet
  | DateFacet;

export const defaultState: FacetGeneratorState = [];

export const defaultImplementation: Partial<FacetGenerator> = {
  subscribe: genericSubscribe,
  state: defaultState,
  facets: [],
  deselectAll: vi.fn(),
};

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
