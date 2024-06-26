import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
  retry,
} from '@reduxjs/toolkit/query';
import {ConfigurationSection} from '../../state/state-sections';

type StateNeededByKnowledgeAPI = ConfigurationSection;

/**
 * `dynamicBaseQuery` is passed to the baseQuery of the createApi,
 * but note that the baseQuery will not be used if a queryFn is provided in the createApi endpoint
 */
const dynamicBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const state = api.getState() as StateNeededByKnowledgeAPI;
  const {accessToken, organizationId, platformUrl} = state.configuration;
  const updatedArgs = {
    ...(args as FetchArgs),
    headers: {
      ...((args as FetchArgs)?.headers || {}),
      Authorization: `Bearer ${accessToken}`,
    },
  };
  try {
    const data = fetchBaseQuery({
      baseUrl: `${platformUrl}/rest/organizations/${organizationId}`,
    })(updatedArgs, api, extraOptions);
    return {data};
  } catch (error) {
    return {error: error as FetchBaseQueryError};
  }
};

export const knowledgeApi = createApi({
  reducerPath: 'knowledge',
  baseQuery: retry(dynamicBaseQuery, {maxRetries: 3}),
  endpoints: () => ({}),
});
