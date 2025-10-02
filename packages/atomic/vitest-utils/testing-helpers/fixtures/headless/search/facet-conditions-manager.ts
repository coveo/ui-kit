import type {FacetConditionsManager} from '@coveo/headless';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

export const buildFakeFacetConditionsManager = (
  implementation?: Partial<FacetConditionsManager>
): FacetConditionsManager => {
  return {
    subscribe: genericSubscribe,
    stopWatching: implementation?.stopWatching || vi.fn(),
  } as FacetConditionsManager;
};
