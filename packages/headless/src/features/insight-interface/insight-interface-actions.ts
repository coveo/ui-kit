import {createAsyncThunk} from '@reduxjs/toolkit';
import {getOrganizationEndpoint} from '../../api/platform-client';
import {isErrorResponse} from '../../api/search/search-api-client';
import {GetInsightInterfaceConfigRequest} from '../../api/service/insight/get-interface/get-interface-config-request';
import {GetInsightInterfaceConfigResponse} from '../../api/service/insight/get-interface/get-interface-config-response';
import {AsyncThunkInsightOptions} from '../../api/service/insight/insight-api-client';
import {
  ConfigurationSection,
  InsightConfigurationSection,
} from '../../state/state-sections';
import {setSearchHub} from '../search-hub/search-hub-actions';

export interface FetchInterfaceThunkReturn {
  /** The successful get interface response. */
  response: GetInsightInterfaceConfigResponse;
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
): GetInsightInterfaceConfigRequest => ({
  accessToken: state.configuration.accessToken,
  organizationId: state.configuration.organizationId,
  url: getOrganizationEndpoint(
    state.configuration.organizationId,
    state.configuration.environment
  ),
  insightId: state.insightConfiguration.insightId,
});
