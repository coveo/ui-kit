import {createAsyncThunk} from '@reduxjs/toolkit';
import {
  searchPageState,
  makeClickActionType,
  partialDocumentInformation,
  documentIdentifier,
} from '../analytics/analytics-actions';
import {configureAnalytics} from '../../api/analytics/analytics';
import {Result} from '../../api/search/search/result';

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
