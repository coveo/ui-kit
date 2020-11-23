import {createAction, createAsyncThunk} from '@reduxjs/toolkit';

import {ActionCreators} from '../../app/undoable';
import {SearchPageEvents} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {
  AnalyticsType,
  makeAnalyticsAction,
} from '../analytics/analytics-actions';
import {
  SearchAppState,
  SearchParametersState,
} from '../../state/search-app-state';

/**
 * Creates a snapshot of the current request parameters and adds it to the interface history.
 * @param (SearchParametersState) The current state of the search parameters.
 */
export const snapshot = createAction<SearchParametersState>('history/snapshot');

/**
 * Moves backward in the interface history.
 */
export const back = createAsyncThunk('history/back', async (_, {dispatch}) => {
  await dispatch(ActionCreators.undo());
  await dispatch(change());
});

/**
 * Moves forward in the interface history.
 */
export const forward = createAsyncThunk(
  'history/forward',
  async (_, {dispatch}) => {
    await dispatch(ActionCreators.redo());
    await dispatch(change());
  }
);

/**
 * Updates the interface state as per the current step in the interface history.
 */
export const change = createAsyncThunk(
  'history/change',
  async (_, {getState}) => {
    const s = getState() as SearchAppState;
    return s.history.present;
  }
);

/**
 * Logs an event which represents a move forward in the interface history.
 */
export const logNavigateForward = makeAnalyticsAction(
  'history/analytics/forward',
  AnalyticsType.Search,
  (client) => client.logSearchEvent('historyForward' as SearchPageEvents) // TODO: Need to create this event natively in coveo.analytics to remove cast
);

/**
 * Logs an event which represents a move backward in the interface history.
 */
export const logNavigateBackward = makeAnalyticsAction(
  'history/analytics/backward',
  AnalyticsType.Search,
  (client) => client.logSearchEvent('historyBackward' as SearchPageEvents) // TODO: Need to create this event natively in coveo.analytics to remove cast
);
