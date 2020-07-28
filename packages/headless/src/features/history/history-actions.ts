import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {SearchPageState} from '../../state';
import {ActionCreators} from '../../app/undoable';
import {SearchParametersState} from '../../search-parameters-state';
import {configureAnalytics} from '../../api/analytics/analytics';
import {SearchPageEvents} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {
  searchPageState,
  makeSearchActionType,
} from '../analytics/analytics-actions';

export const snapshot = createAction<SearchParametersState>('history/snapshot');

export const back = createAsyncThunk('history/back', async (_, {dispatch}) => {
  await dispatch(ActionCreators.undo());
  await dispatch(change());
});

export const forward = createAsyncThunk(
  'history/forward',
  async (_, {dispatch}) => {
    await dispatch(ActionCreators.redo());
    await dispatch(change());
  }
);

export const change = createAsyncThunk(
  'history/change',
  async (_, {getState}) => {
    const s = getState() as SearchPageState;
    return s.history.present;
  }
);

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
