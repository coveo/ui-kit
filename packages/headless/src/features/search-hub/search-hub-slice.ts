import {createReducer} from '@reduxjs/toolkit';
import {updateSearchConfiguration} from '../configuration/configuration-actions.js';
import {change} from '../history/history-actions.js';
import {setSearchHub} from './search-hub-actions.js';
import {getSearchHubInitialState} from './search-hub-state.js';

export const searchHubReducer = createReducer(
  getSearchHubInitialState(),
  (builder) => {
    builder
      .addCase(setSearchHub, (_, action) => action.payload)
      .addCase(
        change.fulfilled,
        (state, action) => action.payload?.searchHub ?? state
      )
      .addCase(
        updateSearchConfiguration,
        (state, action) => action.payload.searchHub || state
      );
  }
);
