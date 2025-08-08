import {isNullOrUndefined} from '@coveo/bueno';
import {createReducer, type Reducer} from '@reduxjs/toolkit';
import type P from 'pino';
import type {Logger} from 'pino';
import {
  updateAnalyticsConfiguration,
  updateBasicConfiguration,
  updateSearchConfiguration,
} from '../../features/configuration/configuration-actions.js';
import {getConfigurationInitialState} from '../../features/configuration/configuration-state.js';
import {setPipeline} from '../../features/pipeline/pipeline-actions.js';
import {getPipelineInitialState} from '../../features/pipeline/pipeline-state.js';
import {setSearchHub} from '../../features/search-hub/search-hub-actions.js';
import {getSearchHubInitialState} from '../../features/search-hub/search-hub-state.js';
import type {SearchAppState} from '../../state/search-app-state.js';
import {type JWTPayload, parseJWT} from '../../utils/jwt-utils.js';

interface CoveoJSONWebToken extends JWTPayload {
  searchHub?: string;
  pipeline?: string;
  userDisplayName?: string;
}

const possiblyWarnOnMismatch = (
  token: CoveoJSONWebToken,
  tokenProp: keyof CoveoJSONWebToken,
  stateProp: string,
  defaultProp: string,
  payload: string | undefined,
  logger: Logger
) => {
  const tokenValue = token[tokenProp];
  if (isNullOrUndefined(tokenValue)) {
    return;
  }

  if (isNullOrUndefined(payload)) {
    return;
  }

  if (payload === tokenValue) {
    return;
  }

  if (payload === defaultProp) {
    return;
  }

  logger.warn(
    `Mismatch on access token (JWT Token) ${tokenProp} and engine configuration.`
  );
  logger.warn(
    `To remove this warning, make sure that access token value [${tokenValue}] matches engine configuration value [${stateProp}]`
  );
};

const shouldReconcileValues = (
  tokenValue: string | undefined,
  stateValue: string
): boolean => {
  if (isNullOrUndefined(tokenValue)) {
    return false;
  }

  if (stateValue === tokenValue) {
    return false;
  }

  return true;
};

const decodeJSONWebToken = (token: string): CoveoJSONWebToken | false => {
  const parsed = parseJWT(token);
  return parsed ? (parsed as CoveoJSONWebToken) : false;
};

const updateSearchHub = (
  jwt: CoveoJSONWebToken,
  state: SearchAppState
): SearchAppState => {
  if (shouldReconcileValues(jwt.searchHub, state.searchHub)) {
    state.searchHub = jwt.searchHub!;
  }
  return state;
};

const handleMismatchOnSearchHub = (
  jwt: CoveoJSONWebToken,
  state: SearchAppState,
  payload: string | undefined,
  logger: P.Logger
): SearchAppState => {
  possiblyWarnOnMismatch(
    jwt,
    'searchHub',
    state.searchHub,
    getSearchHubInitialState(),
    payload,
    logger
  );
  return updateSearchHub(jwt, state);
};

const updatePipeline = (
  jwt: CoveoJSONWebToken,
  state: SearchAppState
): SearchAppState => {
  if (shouldReconcileValues(jwt.pipeline, state.pipeline)) {
    state.pipeline = jwt.pipeline!;
  }
  return state;
};

const handleMismatchOnPipeline = (
  jwt: CoveoJSONWebToken,
  state: SearchAppState,
  payload: string | undefined,
  logger: P.Logger
): SearchAppState => {
  possiblyWarnOnMismatch(
    jwt,
    'pipeline',
    state.pipeline,
    getPipelineInitialState(),
    payload,
    logger
  );
  return updatePipeline(jwt, state);
};

const updateUserDisplayName = (
  jwt: CoveoJSONWebToken,
  state: SearchAppState
): SearchAppState => {
  if (
    shouldReconcileValues(
      jwt.userDisplayName,
      state.configuration.analytics.userDisplayName
    )
  ) {
    state.configuration.analytics.userDisplayName = jwt.userDisplayName!;
  }
  return state;
};

const handleMismatchOnUserDisplayName = (
  jwt: CoveoJSONWebToken,
  state: SearchAppState,
  payload: string | undefined,
  logger: P.Logger
): SearchAppState => {
  possiblyWarnOnMismatch(
    jwt,
    'userDisplayName',
    state.configuration.analytics.userDisplayName,
    getConfigurationInitialState().analytics.userDisplayName,
    payload,
    logger
  );
  return updateUserDisplayName(jwt, state);
};

export const jwtReducer: (logger: P.Logger) => Reducer = (logger) => {
  return createReducer({} as SearchAppState, (builder) => {
    builder
      .addCase(setSearchHub, (state, action) => {
        const jwt = decodeJSONWebToken(state.configuration.accessToken);
        if (!jwt) {
          return state;
        }
        return handleMismatchOnSearchHub(jwt, state, action.payload, logger);
      })
      .addCase(setPipeline, (state, action) => {
        const jwt = decodeJSONWebToken(state.configuration.accessToken);
        if (!jwt) {
          return state;
        }
        return handleMismatchOnPipeline(jwt, state, action.payload, logger);
      })
      .addCase(updateBasicConfiguration, (state, action) => {
        if (state.configuration.accessToken !== action.payload.accessToken) {
          return state;
        }
        const {accessToken} = action.payload;
        if (!accessToken) {
          return state;
        }
        const jwt = decodeJSONWebToken(accessToken);
        if (!jwt) {
          return state;
        }
        return [updatePipeline, updateSearchHub, updateUserDisplayName].reduce(
          (resultingState, updateProp) => updateProp(jwt, resultingState),
          state
        );
      })
      .addCase(updateSearchConfiguration, (state, action) => {
        const jwt = decodeJSONWebToken(state.configuration.accessToken);
        if (!jwt) {
          return state;
        }

        const searchHubReconciled = handleMismatchOnSearchHub(
          jwt,
          state,
          action.payload.searchHub,
          logger
        );
        const pipelineReconciled = handleMismatchOnPipeline(
          jwt,
          searchHubReconciled,
          action.payload?.pipeline,
          logger
        );
        return pipelineReconciled;
      })
      .addCase(updateAnalyticsConfiguration, (state, action) => {
        const jwt = decodeJSONWebToken(state.configuration.accessToken);
        if (!jwt) {
          return state;
        }
        return handleMismatchOnUserDisplayName(
          jwt,
          state,
          action.payload.userDisplayName,
          logger
        );
      });
  });
};
