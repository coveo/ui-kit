import {createReducer} from '@reduxjs/toolkit';
import {
  fetchRedirectUrl,
  registerStandaloneSearchBox,
} from './standalone-search-box-actions';
import {
  getStandaloneSearchBoxInitialState,
  StandaloneSearchBoxEntry,
} from './standalone-search-box-set-state';

export const standaloneSearchBoxSetReducer = createReducer(
  getStandaloneSearchBoxInitialState(),
  (builder) =>
    builder
      .addCase(registerStandaloneSearchBox, (state, action) => {
        const {id, redirectionUrl} = action.payload;

        if (id in state) {
          return;
        }

        state[id] = buildStandaloneSearchBoxEntry(redirectionUrl);
      })
      .addCase(fetchRedirectUrl.pending, (state, action) => {
        const searchBox = state[action.meta.arg.id];

        if (!searchBox) {
          return;
        }

        searchBox.isLoading = true;
      })
      .addCase(fetchRedirectUrl.fulfilled, (state, action) => {
        const url = action.payload;
        const searchBox = state[action.meta.arg.id];

        if (!searchBox) {
          return;
        }

        searchBox.redirectTo = url ? url : searchBox.defaultRedirectionUrl;
      })
      .addCase(fetchRedirectUrl.rejected, (state, action) => {
        const searchBox = state[action.meta.arg.id];

        if (!searchBox) {
          return;
        }

        searchBox.isLoading = false;
      })
);

function buildStandaloneSearchBoxEntry(
  defaultRedirectionUrl: string
): StandaloneSearchBoxEntry {
  return {
    defaultRedirectionUrl,
    redirectTo: '',
    isLoading: false,
    analytics: {
      cause: '',
      metadata: null,
    },
  };
}
