import type {UserActions, UserActionsState} from '@coveo/headless/insight';
import {genericSubscribe} from '../common';

export const buildFakeUserActions = (
  options: Partial<UserActionsState> = {}
): UserActions => {
  const defaultState: UserActionsState = {
    timeline: undefined,
    excludedCustomActions: [],
    loading: false,
    ...options,
  };

  return {
    state: defaultState,
    subscribe: genericSubscribe,
    logOpenUserActions: () => {},
    fetchUserActions: () => {},
  } as UserActions;
};
