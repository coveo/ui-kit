import {DidYouMean, DidYouMeanState} from '@coveo/headless/commerce';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

export const defaultState: DidYouMeanState = {
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
    ...(state && {state: {...defaultState, ...state}}),
  }) as DidYouMean;
