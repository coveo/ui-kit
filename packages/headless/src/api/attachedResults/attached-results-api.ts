import {
  type BaseQueryFn,
  createApi,
  type FetchArgs,
  type FetchBaseQueryError,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query';
import type {AttachedResultsAPIState} from './attached-results-api-state.js';
import {getInsightSearchApiBaseUrl} from '../platform-client.js';

/**
 * `dynamicBaseQuery` is passed to the baseQuery of the createApi,
 * but note that the baseQuery will not be used if a queryFn is provided in the createApi endpoint
 */
const dynamicBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const state = api.getState() as AttachedResultsAPIState;
  const {accessToken, environment, organizationId} = state.configuration;
  const {numberOfResults} = state.attachedResults;
  const platformEndpoint = getInsightSearchApiBaseUrl(
    organizationId,
    state.insightConfiguration.insightId,
    environment
  );

  const updatedArgs = {
    ...(args as FetchArgs),
    headers: {
      ...((args as FetchArgs)?.headers || {}),
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: {
      ...((args as FetchArgs)?.body || {}),
      numberOfResults,
    },
  };

  try {
    const data = fetchBaseQuery({
      baseUrl: platformEndpoint,
    })(
      updatedArgs,
      {...api, signal: null as unknown as AbortSignal},
      extraOptions
    );
    return {data};
  } catch (error) {
    return {error: error as FetchBaseQueryError};
  }
};

export const attachedResultsApi = createApi({
  reducerPath: 'attachedResultsApi',
  baseQuery: dynamicBaseQuery,
  endpoints: (builder) => ({
    getAttachedResults: builder.query<
      any, // you can replace with proper type later
      {permanentIds: string[]; firstResult: number}
    >({
      query: ({permanentIds, firstResult}) => ({
        url: '',
        method: 'POST',
        body: {
          aq: `@permanentid==(1d0d26b65f48c362f58d0b0302d9d9ab2db5b8c9cfc76ce9de9368815225,${permanentIds.length ? permanentIds.join(',') : ''} 19c848833ebbf39b88d34b49300e5f643b6245f22fe6f51134dacdd95929)`,
          firstResult,
        },
      }),
    }),
  }),
});

export const fetchAttachedResults = (
  caseId: string,
  state: AttachedResultsAPIState
) =>
  attachedResultsApi.endpoints.getAttachedResults.initiate({
    permanentIds: state.attachedResults.results
      .filter((r) => r.caseId === caseId)
      .map((r) => r.permanentId)
      .filter((id): id is string => !!id),
    firstResult: state.attachedResults.firstResult,
  });

export const selectAttachedResults = (caseId: string, state: AttachedResultsAPIState) =>
  attachedResultsApi.endpoints.getAttachedResults.select({
    permanentIds: state.attachedResults.results
      .filter((r) => r.caseId === caseId)
      .map((r) => r.permanentId)
      .filter((id): id is string => !!id),
    firstResult: state.attachedResults.firstResult,
  })(state);
