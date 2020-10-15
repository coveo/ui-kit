import {createAsyncThunk} from '@reduxjs/toolkit';
import {
  searchPageState,
  makeClickActionType,
} from '../analytics/analytics-actions';
import {
  partialDocumentInformation,
  documentIdentifier,
} from '../analytics/analytics-utils';
import {configureAnalytics} from '../../api/analytics/analytics';
import {Result} from '../../api/search/search/result';

/**
 * Logs a click event with an `actionCause` value of `documentOpen`.
 * @param result (Result) The result that was opened.
 */
export const logDocumentOpen = createAsyncThunk(
  'analytics/result/open',
  async (result: Result, {getState}) => {
    const state = searchPageState(getState);

    await configureAnalytics(state).logDocumentOpen(
      partialDocumentInformation(result, state),
      documentIdentifier(result)
    );

    return makeClickActionType();
  }
);
