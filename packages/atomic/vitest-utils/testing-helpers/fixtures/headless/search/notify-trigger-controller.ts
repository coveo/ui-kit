import type {NotifyTrigger, NotifyTriggerState} from '@coveo/headless';
import {genericSubscribe} from '../common';

export const defaultState = {
  notifications: [],
} satisfies NotifyTriggerState;

export const defaultImplementation = {
  subscribe: genericSubscribe,
  state: defaultState,
} satisfies NotifyTrigger;

export const buildFakeNotifyTrigger = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<NotifyTrigger>;
  state?: Partial<NotifyTriggerState>;
}> = {}): NotifyTrigger =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...{state: {...defaultState, ...(state || {})}},
  }) as NotifyTrigger;
