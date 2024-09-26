import {createAsyncThunk} from '@reduxjs/toolkit';
import {historyStore} from '../../api/analytics/coveo-analytics-utils.js';
import {SearchAppState} from '../../state/search-app-state.js';

export const addPageViewEntryInActionsHistory = createAsyncThunk(
  'analytics/addPageViewEntry',
  async (itemPermanentId: string, {getState}) => {
    const state = getState() as SearchAppState;
    if (state.configuration.analytics.enabled) {
      historyStore.addElement({
        name: 'PageView',
        value: itemPermanentId,
        time: JSON.stringify(new Date()),
      });
    }
  }
);
