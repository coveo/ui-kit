import {AnyAction, Middleware} from 'redux';
import {getRecommendations} from '../features/recommendation/recommendation-actions';
import {executeSearch} from '../features/search/search-actions';
import {getProductRecommendations} from '../features/product-recommendations/product-recommendations-actions';

export const analyticsMiddleware: Middleware = (api) => (next) => (action) => {
  // Why all these shenanigans ?
  // https://redux.js.org/style-guide/style-guide#do-not-put-non-serializable-values-in-state-or-actions
  // analyticsActions is returned as a function in some action payload. A function is non serializable.
  // This is not recommended, with one exception: It has to be handled before any reducer has the chance to do it's job, and should not stored in the state.
  // To meet those conditions, we ensure the analyticsMiddleware is always the first executed (in store.ts/configureStore) and that it is removed from the payload.
  // We only keep a reference to the function in order to dispatch it correctly after the reducer (next) has the chance of processing the action/state change
  const analyticsActions = action.payload?.analyticsActions;
  if (analyticsActions !== undefined) {
    delete action.payload?.analyticsActions;
  }

  const ret = next(action);

  if (
    action.type === executeSearch.fulfilled.type &&
    analyticsActions === undefined
  ) {
    console.error('No analytics action associated with search:', action);
  }

  if (
    action.type === getRecommendations.fulfilled &&
    analyticsActions === undefined
  ) {
    console.error(
      'No analytics action associated with recommendation:',
      action
    );
  }

  if (
    action.type === getProductRecommendations.fulfilled &&
    analyticsActions === undefined
  ) {
    console.error(
      'No analytics action associated with product recommendation:',
      action
    );
  }

  if (analyticsActions !== undefined) {
    analyticsActions.forEach((analyticsAction: AnyAction) =>
      api.dispatch(analyticsAction)
    );
  }

  return ret;
};
