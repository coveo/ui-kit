import {createReducer} from '@reduxjs/toolkit';
import {
  fetchRedirectUrl,
  registerStandaloneSearchBox,
  updateAnalyticsToOmniboxFromLink,
  updateAnalyticsToSearchFromLink,
} from './standalone-search-box-set-actions';
import {
  getStandaloneSearchBoxSetInitialState,
  StandaloneSearchBoxEntry,
} from './standalone-search-box-set-state';

export const standaloneSearchBoxSetReducer = createReducer(
  getStandaloneSearchBoxSetInitialState(),
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
