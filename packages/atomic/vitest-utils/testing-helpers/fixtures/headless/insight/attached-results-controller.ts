import type {
  AttachedResults,
  AttachedResultsState,
} from '@coveo/headless/insight';
import {vi} from 'vitest';

const defaultState = {
  results: [],
  loading: false,
} satisfies AttachedResultsState;

const defaultImplementation = {
  subscribe: (subscribedFunction: () => void) => {
    subscribedFunction();
    return vi.fn();
  },
  state: defaultState,
  isAttached: vi.fn(() => false),
  attach: vi.fn(),
  detach: vi.fn(),
} satisfies AttachedResults;

export const buildFakeAttachedResults = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<AttachedResults>;
  state?: Partial<AttachedResultsState>;
}> = {}): AttachedResults =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...{state: {...defaultState, ...(state || {})}},
  }) as AttachedResults;
