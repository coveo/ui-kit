import {createAsyncThunk} from '@reduxjs/toolkit';
import {isErrorResponse} from '../../api/search/search-api-client';
import {GetInsightInterfaceRequest} from '../../api/service/insight/get-interface/get-interface-request';
import {GetInsightInterfaceResponse} from '../../api/service/insight/get-interface/get-interface-response';
import {AsyncThunkInsightOptions} from '../../api/service/insight/insight-api-client';
import {
  ConfigurationSection,
  InsightConfigurationSection,
} from '../../state/state-sections';
import {setSearchHub} from '../search-hub/search-hub-actions';

export interface FetchInterfaceThunkReturn {
  /** The successful get interface response. */
  response: GetInsightInterfaceResponse;
}

export type StateNeededByFetchInterface = ConfigurationSection &
  InsightConfigurationSection;

export const fetchInterface = createAsyncThunk<
  FetchInterfaceThunkReturn,
  void,
  AsyncThunkInsightOptions<StateNeededByFetchInterface>
>(
  'insight/interface/fetch',
  async (_, {getState, dispatch, rejectWithValue, extra: {apiClient}}) => {
    const state = getState();

    const fetched = await apiClient.getInterface(
      buildGetInsightInterfaceRequest(state)
    );

    if (isErrorResponse(fetched)) {
      return rejectWithValue(fetched.error);
    }

    dispatch(setSearchHub(fetched.success.searchHub));

    return {
      response: fetched.success,
    };
  }
);

const buildGetInsightInterfaceRequest = (
  state: StateNeededByFetchInterface
): GetInsightInterfaceRequest => ({
  accessToken: state.configuration.accessToken,
  organizationId: state.configuration.organizationId,
  url: state.configuration.platformUrl,
  insightId: state.insightConfiguration.insightId,
});
