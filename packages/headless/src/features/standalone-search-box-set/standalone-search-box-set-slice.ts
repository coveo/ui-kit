import {createReducer} from '@reduxjs/toolkit';
import {
  fetchRedirectUrl,
  registerStandaloneSearchBox,
  resetStandaloneSearchBox,
  updateAnalyticsToOmniboxFromLink,
  updateAnalyticsToSearchFromLink,
  updateStandaloneSearchBoxRedirectionUrl,
} from './standalone-search-box-set-actions.js';
import {
  getStandaloneSearchBoxSetInitialState,
  type StandaloneSearchBoxEntry,
} from './standalone-search-box-set-state.js';

export const standaloneSearchBoxSetReducer = createReducer(
  getStandaloneSearchBoxSetInitialState(),
  (builder) =>
    builder
      .addCase(registerStandaloneSearchBox, (state, action) => {
        const {id, redirectionUrl, overwrite} = action.payload;

        if (!overwrite && id in state) {
          return;
        }

        state[id] = buildStandaloneSearchBoxEntry(redirectionUrl);
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
      .addCase(updateStandaloneSearchBoxRedirectionUrl, (state, action) => {
        const {id, redirectionUrl} = action.payload;

        if (!(id in state)) {
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
        searchBox.isLoading = false;
      })
      .addCase(fetchRedirectUrl.rejected, (state, action) => {
        const searchBox = state[action.meta.arg.id];

        if (!searchBox) {
          return;
        }

        searchBox.isLoading = false;
      })
      .addCase(updateAnalyticsToSearchFromLink, (state, action) => {
        const searchBox = state[action.payload.id];

        if (!searchBox) {
          return;
        }

        searchBox.analytics.cause = 'searchFromLink';
      })
      .addCase(updateAnalyticsToOmniboxFromLink, (state, action) => {
        const searchBox = state[action.payload.id];

        if (!searchBox) {
          return;
        }

        searchBox.analytics.cause = 'omniboxFromLink';
        searchBox.analytics.metadata = action.payload.metadata;
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
