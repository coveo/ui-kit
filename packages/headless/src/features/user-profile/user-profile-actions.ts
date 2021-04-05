import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  ConfigurationSection,
  UserProfileSection,
} from '../../state/state-sections';
import {UserActionsRequest} from '../../api/machine-learning/user-profiles/user-actions-request';
import {
  AsyncThunkMLRequestOptions,
  isErrorResponse,
  MLAPIClient,
} from '../../api/machine-learning/ml-api-client';
import {UserActionsSuccessContent} from '../../api/machine-learning/user-profiles/user-actions-response';
import {UserAction, UserActionType, ActionHistory} from './user-profile-state';
import {Result} from '../../api/search/search/result';
import {
  isSuccessResponse,
  SearchAPIClient,
} from '../../api/search/search-api-client';
import {StringValue} from '@coveo/bueno';
import {validatePayload} from '../../utils/validate-payload';
import {ThunkExtraArguments} from '../../app/store';
import {UserProfileAppState} from '../../state/user-profile-app-state';

export type StateNeededByExecuteGetUserActions = ConfigurationSection &
  Partial<UserProfileSection>;

export interface ExecuteGetUserActionsThunkReturn {
  /** The retrieved user actions */
  userActions: UserAction[];
  /** The number of milliseconds it took to receive the response. */
  duration: number;
}

export interface AsyncThunkOptions {
  state: UserProfileAppState;
  extra: ThunkExtraArguments;
}

export const updateUserProfileUserId = createAction(
  'userProfile/updateUserProfileUserId',
  (payload: {userId?: string}) =>
    validatePayload(payload, {
      userId: new StringValue({emptyAllowed: false, required: false}),
    })
);

const fetchUserActionsFromAPI = async (
  client: MLAPIClient,
  state: StateNeededByExecuteGetUserActions
) => {
  const startedAt = new Date().getTime();
  const response = await client.userActions(buildUserActionsRequest(state));
  const duration = new Date().getTime() - startedAt;
  return {response, duration};
};

const fetchDocumentsFromAPI = async (
  client: SearchAPIClient,
  state: StateNeededByExecuteGetUserActions,
  documentURIs: string[]
) => {
  const response = await client.search(
    buildDocumentFetchRequest(state, documentURIs)
  );
  return {response};
};

export const buildUserActionsRequest = (
  state: StateNeededByExecuteGetUserActions
): UserActionsRequest => {
  return {
    url: `${state.configuration.platformUrl}/rest/organizations/${state.configuration.organizationId}/machinelearning`,
    accessToken: state.configuration.accessToken,
    organizationId: state.configuration.organizationId,
    objectId: state.userProfile?.userId,
  };
};

const buildDocumentFetchRequest = (
  state: StateNeededByExecuteGetUserActions,
  documentURIs: string[]
) => {
  return {
    accessToken: state.configuration.accessToken,
    organizationId: state.configuration.organizationId,
    url: state.configuration.search.apiBaseUrl,
    aq: documentURIs.map((uri) => `@urihash==${uri}`).join(' OR '),
    numberOfResults: documentURIs.length,
  };
};

/**
 * Get user actions
 */
export const executeGetUserActions = createAsyncThunk<
  ExecuteGetUserActionsThunkReturn,
  void,
  AsyncThunkMLRequestOptions<StateNeededByExecuteGetUserActions>
>(
  'userProfile/getUserActions',
  async (
    _,
    {getState, rejectWithValue, extra: {mlAPIClient, searchAPIClient}}
  ) => {
    const state = getState() as StateNeededByExecuteGetUserActions;
    const fetched = await fetchUserActionsFromAPI(mlAPIClient, state);

    if (isErrorResponse(fetched.response)) {
      return rejectWithValue(fetched.response);
    }

    const actionHistory = parseResponse(fetched.response.success);
    const userActions = await buildUserActions(
      actionHistory,
      state,
      searchAPIClient
    );

    return {
      userActions,
      duration: fetched.duration,
    };
  }
);

const parseResponse = (
  response: UserActionsSuccessContent
): ActionHistory[] => {
  return response.value.map((v) => {
    return {
      time: parseInt(v.time),
      value: JSON.parse(v.value) as {[key: string]: string},
      name: v.name as UserActionType,
    };
  });
};

const fetchDocuments = async (
  state: StateNeededByExecuteGetUserActions,
  client: SearchAPIClient,
  uriHashes: string[]
): Promise<{[urihash: string]: Result}> => {
  if (uriHashes.length === 0) {
    return Promise.resolve({});
  }

  try {
    const fetched = await fetchDocumentsFromAPI(client, state, uriHashes);
    if (isSuccessResponse(fetched.response)) {
      const documentsDict = fetched.response.success.results.reduce(
        (acc, result) => ({...acc, [result.raw.urihash]: result}),
        {}
      );
      return documentsDict;
    }
  } catch (e) {
    console.log(e.message);
  }
  return Promise.resolve({});
};

const buildUserActions = async (
  actions: ActionHistory[],
  state: StateNeededByExecuteGetUserActions,
  searchAPIClient: SearchAPIClient
): Promise<UserAction[]> => {
  let documents = {} as {[urihash: string]: Result};

  const uriHashes = actions
    .filter(isClick)
    .map((action) => action.value.uri_hash)
    .filter((value, index, list) => list.indexOf(value) === index);

  documents = await fetchDocuments(state, searchAPIClient, uriHashes);

  return actions.map((action) => {
    return new UserAction(
      action.name,
      new Date(action.time),
      action.value,
      isClickOrView(action) ? documents[action.value.uri_hash] : undefined,
      isSearch(action) ? action.value.query_expression : undefined
    );
  });
};

const isClick = (action: ActionHistory) => {
  return action.name === UserActionType.Click;
};

const isClickOrView = (action: ActionHistory) => {
  return isClick(action) || action.name === UserActionType.PageView;
};

const isSearch = (action: ActionHistory) => {
  return action.name === UserActionType.Search;
};
