import type {
  AutomaticFacet,
  AutomaticFacetGenerator,
  AutomaticFacetGeneratorState,
} from '@coveo/headless';
import {genericSubscribe} from '../common';

export const defaultState: AutomaticFacetGeneratorState = {
  automaticFacets: [],
};

export const defaultImplementation = {
  subscribe: genericSubscribe,
  state: defaultState,
} satisfies AutomaticFacetGenerator;

interface BuildFakeAutomaticFacetGeneratorOptions {
  implementation?: Partial<AutomaticFacetGenerator>;
  state?: Partial<AutomaticFacetGeneratorState>;
  automaticFacets?: AutomaticFacet[];
}

export const buildFakeAutomaticFacetGenerator = ({
  implementation,
  state,
  automaticFacets,
}: BuildFakeAutomaticFacetGeneratorOptions = {}): AutomaticFacetGenerator => {
  const facets = automaticFacets ?? [];
  return {
    ...defaultImplementation,
    ...implementation,
    state: {
      ...defaultState,
      automaticFacets: facets,
      ...(state || {}),
    },
  } as AutomaticFacetGenerator;
};
