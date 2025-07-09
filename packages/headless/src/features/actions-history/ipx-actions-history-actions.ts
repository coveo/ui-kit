import {createAsyncThunk} from '@reduxjs/toolkit';
import HistoryStore from '../../api/analytics/coveo.analytics/history-store.js';
import type {SearchAppState} from '../../state/search-app-state.js';

export const addPageViewEntryInActionsHistory = createAsyncThunk(
  'analytics/addPageViewEntry',
  async (itemPermanentId: string, {getState}) => {
    const state = getState() as SearchAppState;
    if (state.configuration.analytics.enabled) {
      HistoryStore.getInstance().addElement({
        name: 'PageView',
        value: itemPermanentId,
        time: JSON.stringify(new Date()),
      });
    }
  }
);
