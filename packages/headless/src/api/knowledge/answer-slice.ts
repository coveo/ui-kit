import {
  type BaseQueryFn,
  createApi,
  type FetchArgs,
  type FetchBaseQueryError,
  fetchBaseQuery,
  retry,
} from '@reduxjs/toolkit/query';
import type {
  ConfigurationSection,
  GeneratedAnswerSection,
} from '../../state/state-sections.js';
import {getOrganizationEndpoint} from '../platform-client.js';

type StateNeededByAnswerSlice = ConfigurationSection & GeneratedAnswerSection;

/**
 * `dynamicBaseQuery` is passed to the baseQuery of the createApi,
 * but note that the baseQuery will not be used if a queryFn is provided in the createApi endpoint
 */
const dynamicBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const state = api.getState() as StateNeededByAnswerSlice;
  const {accessToken, environment, organizationId} = state.configuration;
  const answerConfigurationId = state.generatedAnswer.answerConfigurationId;
  const updatedArgs = {
    ...(args as FetchArgs),
    headers: {
      ...((args as FetchArgs)?.headers || {}),
      Authorization: `Bearer ${accessToken}`,
    },
  };
  try {
    const platformEndpoint = getOrganizationEndpoint(
      organizationId,
      environment
    );
    const data = fetchBaseQuery({
      baseUrl: `${platformEndpoint}/rest/organizations/${organizationId}/answer/v1/configs/${answerConfigurationId}`,
    })(updatedArgs, api, extraOptions);
    return {data};
  } catch (error) {
    return {error: error as FetchBaseQueryError};
  }
};

export const answerSlice = createApi({
  reducerPath: 'answer',
  baseQuery: retry(dynamicBaseQuery, {maxRetries: 3}),
  endpoints: () => ({}),
});
