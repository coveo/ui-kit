import {isNullOrUndefined} from '@coveo/bueno';
import {createReducer, Reducer} from '@reduxjs/toolkit';
import {atob as atobshim} from 'abab';
import P, {Logger} from 'pino';
import {SearchAppState} from '../..';
import {
  updateAnalyticsConfiguration,
  updateSearchConfiguration,
} from '../../features/configuration/configuration-actions';
import {getConfigurationInitialState} from '../../features/configuration/configuration-state';
import {setPipeline} from '../../features/pipeline/pipeline-actions';
import {getPipelineInitialState} from '../../features/pipeline/pipeline-state';
import {setSearchHub} from '../../features/search-hub/search-hub-actions';
import {getSearchHubInitialState} from '../../features/search-hub/search-hub-state';

export interface CoveoJSONWebToken {
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

  if (stateProp === tokenValue) {
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
  try {
    const atobImplementation = typeof atob !== 'undefined' ? atob : atobshim;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const base64decoded = atobImplementation(base64);
    if (!base64decoded) {
      return false;
    }
    const jsonPayload = decodeURIComponent(
      base64decoded
        .split('')
        .map((character) => {
          return '%' + ('00' + character.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    return JSON.parse(jsonPayload) as CoveoJSONWebToken;
  } catch (e) {
    return false;
  }
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
  if (shouldReconcileValues(jwt.searchHub, state.searchHub)) {
    state.searchHub = jwt.searchHub!;
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
  if (shouldReconcileValues(jwt.pipeline, state.pipeline)) {
    state.pipeline = jwt.pipeline!;
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
