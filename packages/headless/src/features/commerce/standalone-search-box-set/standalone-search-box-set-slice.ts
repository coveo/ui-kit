import {createReducer} from '@reduxjs/toolkit';
import {
  registerStandaloneSearchBox,
  resetStandaloneSearchBox,
} from '../../standalone-search-box-set/standalone-search-box-set-actions';
import {fetchRedirectUrl} from './standalone-search-box-set-actions';
import {
  getCommerceStandaloneSearchBoxSetInitialState,
  StandaloneSearchBoxEntry,
} from './standalone-search-box-set-state';

export const standaloneSearchBoxSetReducer = createReducer(
  getCommerceStandaloneSearchBoxSetInitialState(),
  (builder) =>
    builder
      .addCase(registerStandaloneSearchBox, (state, action) => {
        const {id, redirectionUrl} = action.payload;

        if (id in state) {
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
      .addCase(fetchRedirectUrl, (state, action) => {
        const {redirectionUrl} = action.payload;
        const searchBox = state[action.payload.id];

        if (!searchBox) {
          return;
        }

        searchBox.redirectTo = redirectionUrl
          ? redirectionUrl
          : searchBox.defaultRedirectionUrl;
      })
);

function buildStandaloneSearchBoxEntry(
  defaultRedirectionUrl: string
): StandaloneSearchBoxEntry {
  return {
    defaultRedirectionUrl,
    redirectTo: '',
  };
}
