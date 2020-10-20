import {createAction, createAsyncThunk} from '@reduxjs/toolkit';

import {ActionCreators} from '../../app/undoable';

import {configureAnalytics} from '../../api/analytics/analytics';
import {SearchPageEvents} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {
  searchPageState,
  makeSearchActionType,
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
export const logNavigateForward = createAsyncThunk(
  'history/analytics/forward',
  async (_, {getState}) => {
    // TODO: This is not exactly what happens in JSUI as of today. In JSUI, we currently try to map the state change to an "actual" analytics event.
    // But, it is still probably acceptable to log this in this format, and much simpler for headless in the end.
    // TBD if this is a problem. We'll adjust accordingly if it's the case.
    const state = searchPageState(getState);
    await configureAnalytics(state).logSearchEvent(
      'historyForward' as SearchPageEvents
    );
    return makeSearchActionType();
  }
);

/**
 * Logs an event which represents a move backward in the interface history.
 */
export const logNavigateBackward = createAsyncThunk(
  'history/analytics/backward',
  async (_, {getState}) => {
    // TODO: This is not exactly what happens in JSUI as of today. In JSUI, we currently try to map the state change to an "actual" analytics event.
    // But, it is still probably acceptable to log this in this format, and much simpler for headless in the end.
    // TBD if this is a problem. We'll adjust accordingly if it's the case.
    const state = searchPageState(getState);
    await configureAnalytics(state).logSearchEvent(
      'historyBackward' as SearchPageEvents
    );
    return makeSearchActionType();
  }
);
