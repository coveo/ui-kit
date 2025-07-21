import {createReducer} from '@reduxjs/toolkit';
import {
  fetchRedirectUrl,
  registerStandaloneSearchBox,
  resetStandaloneSearchBox,
  updateStandaloneSearchBoxRedirectionUrl,
} from './standalone-search-box-set-actions.js';
import {
  getCommerceStandaloneSearchBoxSetInitialState,
  type StandaloneSearchBoxEntry,
} from './standalone-search-box-set-state.js';

export const commerceStandaloneSearchBoxSetReducer = createReducer(
  getCommerceStandaloneSearchBoxSetInitialState(),
  (builder) =>
    builder
      .addCase(registerStandaloneSearchBox, (state, action) => {
        const {id, redirectionUrl, overwrite} = action.payload;

        if (!overwrite && id in state) {
          return;
        }

        state[id] = buildStandaloneSearchBoxEntry(redirectionUrl);
      })
      .addCase(updateStandaloneSearchBoxRedirectionUrl, (state, action) => {
        const {id, redirectionUrl} = action.payload;
        const searchBox = state[id];

        if (!searchBox) {
          return;
        }

        searchBox.defaultRedirectionUrl = redirectionUrl;
      })
      .addCase(resetStandaloneSearchBox, (state, action) => {
        const {id} = action.payload;
        const searchBox = state[id];

        if (searchBox) {
          state[id] = buildStandaloneSearchBoxEntry(
            searchBox.defaultRedirectionUrl
          );
          return;
        }
      })
      .addCase(fetchRedirectUrl.pending, (state, action) => {
        const searchBox = state[action.meta.arg.id];

        if (!searchBox) {
          return;
        }

        searchBox.isLoading = true;
      })
      .addCase(fetchRedirectUrl.fulfilled, (state, action) => {
        const redirectionUrl = action.payload;
        const searchBox = state[action.meta.arg.id];

        if (!searchBox) {
          return;
        }

        searchBox.redirectTo = redirectionUrl
          ? redirectionUrl
          : searchBox.defaultRedirectionUrl;

        searchBox.isLoading = false;
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
  };
}
