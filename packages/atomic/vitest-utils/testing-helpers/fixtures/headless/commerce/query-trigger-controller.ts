import type {QueryTrigger, QueryTriggerState} from '@coveo/headless/commerce';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

export const defaultState = {
  wasQueryModified: false,
  originalQuery: '',
  newQuery: '',
} satisfies QueryTriggerState;

export const defaultImplementation = {
  undo: vi.fn() as () => void,
  subscribe: genericSubscribe,
  state: defaultState,
} satisfies QueryTrigger;

export const buildFakeQueryTrigger = (
  state?: Partial<QueryTriggerState>
): QueryTrigger =>
  ({
    ...defaultImplementation,
    ...{state: {...defaultState, ...(state || {})}},
  }) as QueryTrigger;
