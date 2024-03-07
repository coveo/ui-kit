import {Middleware, UnknownAction} from '@reduxjs/toolkit';

type UnknownActionWithPossibleAnalyticsPayload = UnknownAction & {
  payload: {analyticsAction?: unknown};
};

export const analyticsMiddleware: Middleware = (api) => (next) => (action) => {
  // Why all these shenanigans ?
  // https://redux.js.org/style-guide/style-guide#do-not-put-non-serializable-values-in-state-or-actions
  // analyticsAction is returned as a function in some action payload. A function is non serializable.
  // This is not recommended, with one exception: It has to be handled before any reducer has the chance to do it's job, and should not stored in the state.
  // To meet those conditions, we ensure the analyticsMiddleware is always the first executed (in store.ts/configureStore) and that it is removed from the payload.
  // We only keep a reference to the function in order to dispatch it correctly after the reducer (next) has the chance of processing the action/state change

  const actionWithPossibleAnalytics =
    action as UnknownActionWithPossibleAnalyticsPayload;

  const analytics = actionWithPossibleAnalytics.payload?.analyticsAction;

  if (analytics !== undefined) {
    delete actionWithPossibleAnalytics.payload.analyticsAction;
  }

  const ret = next(action);

  if (
    actionWithPossibleAnalytics.type === 'search/executeSearch/fullfilled' &&
    analytics === undefined
  ) {
    console.error('No analytics action associated with search:', action);
  }

  if (
    actionWithPossibleAnalytics.type === 'recommendation/get/fullfilled' &&
    analytics === undefined
  ) {
    console.error(
      'No analytics action associated with recommendation:',
      action
    );
  }

  if (
    actionWithPossibleAnalytics.type ===
      'productRecommendations/get/fullfilled' &&
    analytics === undefined
  ) {
    console.error(
      'No analytics action associated with product recommendation:',
      action
    );
  }

  if (analytics !== undefined) {
    api.dispatch(actionWithPossibleAnalytics);
  }

  return ret;
};
