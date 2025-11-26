import type {FacetManager, FacetManagerState} from '@coveo/headless';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

export const buildFakeFacetManager = ({
  state = {},
  implementation = {},
}: {
  state?: Partial<FacetManagerState>;
  implementation?: Partial<FacetManager>;
} = {}): FacetManager => {
  const defaultState = {
    facetIds: [],
    ...state,
  } satisfies FacetManagerState;

  return {
    subscribe: genericSubscribe,
    state: defaultState,
    sort: vi.fn(),
    ...implementation,
  } as FacetManager;
};
