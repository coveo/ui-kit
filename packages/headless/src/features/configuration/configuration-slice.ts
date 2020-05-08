import {createReducer, createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {ConfigurationState} from '../../state';

export const updateBasicConfiguration = createAction<{
  accessToken: string;
  organization: string;
}>('configuration/updateBasicConfiguration');

export const updateSearchConfiguration = createAction<{endpoint?: string}>(
  'configuration/updateSearchConfiguration'
);

export const getConfigurationInitialState: () => ConfigurationState = () => ({
  organizationId: '',
  accessToken: '',
  search: {
    endpoint: 'https://globalplatform.cloud.coveo.com/rest/search',
  },
});

export const renewAccessToken = createAsyncThunk(
  'configuration/renewAccessToken',
  async (renew: () => Promise<string>) => {
    return await renew();
  }
);

export const configurationReducer = createReducer(
  getConfigurationInitialState(),
  builder =>
    builder
      .addCase(updateBasicConfiguration, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.organizationId = action.payload.organization;
      })
      .addCase(updateSearchConfiguration, (state, action) => {
        if (action.payload.endpoint) {
          state.search.endpoint = action.payload.endpoint;
        }
      })
      .addCase(renewAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload;
      })
);
