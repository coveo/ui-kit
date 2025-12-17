import type {DidYouMean, DidYouMeanState} from '@coveo/headless';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

export const defaultState = {
  hasQueryCorrection: false,
  originalQuery: '',
  wasCorrectedTo: '',
  wasAutomaticallyCorrected: false,
  queryCorrection: {
    correctedQuery: '',
    wordCorrections: [],
  },
} satisfies DidYouMeanState;

export const defaultImplementation = {
  subscribe: genericSubscribe,
  state: defaultState,
  applyCorrection: vi.fn() as () => void,
  updateQueryCorrectionMode: vi.fn() as (mode: 'legacy' | 'next') => void,
} satisfies DidYouMean;

export const buildFakeDidYouMean = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<DidYouMean>;
  state?: Partial<DidYouMeanState>;
}> = {}): DidYouMean =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...{state: {...defaultState, ...(state || {})}},
  }) as DidYouMean;
