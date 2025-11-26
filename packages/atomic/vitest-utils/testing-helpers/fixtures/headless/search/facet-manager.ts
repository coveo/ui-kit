import type {FacetManager, FacetManagerState} from '@coveo/headless';
import {vi} from 'vitest';

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
    subscribe: vi.fn((callback) => {
      callback();
      return vi.fn();
    }),
    state: defaultState,
    sort: vi.fn(),
    ...implementation,
  } as FacetManager;
};
