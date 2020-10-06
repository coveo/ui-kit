import {createReducer} from '@reduxjs/toolkit';
import {setSearchHub} from './search-hub-actions';
import {change} from '../history/history-actions';
import {updateSearchConfiguration} from '../configuration/configuration-actions';

export const getSearchHubInitialState = () => 'default';

export const searchHubReducer = createReducer(
  getSearchHubInitialState(),
  (builder) => {
    builder
      .addCase(setSearchHub, (_, action) => action.payload)
      .addCase(change.fulfilled, (_, action) => action.payload.searchHub)
      .addCase(
        updateSearchConfiguration,
        (_, action) => action.payload.searchHub
      );
  }
);
