/* eslint-disable @typescript-eslint/no-explicit-any */
import {Middleware} from 'redux';
import {
  ConfigurationSection,
  PipelineSection,
  SearchHubSection,
} from '../state/state-sections';
import {Logger} from 'pino';
import {setSearchHub} from '../features/search-hub/search-hub-actions';
import {setPipeline} from '../features/pipeline/pipeline-actions';
import {updateAnalyticsConfiguration} from '../features/configuration/configuration-actions';
import {isNullOrUndefined} from '@coveo/bueno';
import {getConfigurationInitialState} from '../features/configuration/configuration-state';
import {getSearchHubInitialState} from '../features/search-hub/search-hub-state';
import {getPipelineInitialState} from '../features/pipeline/pipeline-state';

export interface CoveoJSONWebToken {
  searchHub?: string;
  pipeline?: string;
  userDisplayName?: string;
}

export const jwtMiddleware: (logger: Logger) => Middleware =
  (logger) => (api) => (next) => (action) => {
    const ret = next(action);

    const state = api.getState();

    if (!isConfigSection(state)) {
      return ret;
    }

    const jwtToken = decodeJSONWebToken(state.configuration.accessToken);
    if (!jwtToken) {
      return ret;
    }

    if (
      shouldMatchValuesAndPossiblyWarn(
        jwtToken,
        'userDisplayName',
        state.configuration.analytics.userDisplayName,
        getConfigurationInitialState().analytics.userDisplayName,
        logger
      )
    ) {
      api.dispatch(
        updateAnalyticsConfiguration({
          userDisplayName: jwtToken.userDisplayName,
        })
      );
    }

    if (
      isConfigAndSearchhubSection(state) &&
      shouldMatchValuesAndPossiblyWarn(
        jwtToken,
        'searchHub',
        state.searchHub,
        getSearchHubInitialState(),
        logger
      )
    ) {
      api.dispatch(setSearchHub(jwtToken.searchHub!));
    }

    if (
      isConfigAndPipelineSection(state) &&
      shouldMatchValuesAndPossiblyWarn(
        jwtToken,
        'pipeline',
        state.pipeline,
        getPipelineInitialState(),
        logger
      )
    ) {
      logger.warn('MISMATCH PIPELINE');
      api.dispatch(setPipeline(jwtToken.pipeline!));
    }

    return ret;
  };

function isConfigSection(state: any): state is ConfigurationSection {
  return state.configuration;
}
const isConfigAndSearchhubSection = (
  state: any
): state is ConfigurationSection & SearchHubSection =>
  state.searchHub && isConfigSection(state);

const isConfigAndPipelineSection = (
  state: any
): state is ConfigurationSection & PipelineSection =>
  state.pipeline && isConfigSection(state);

const shouldMatchValuesAndPossiblyWarn = (
  token: CoveoJSONWebToken,
  tokenProp: keyof CoveoJSONWebToken,
  stateProp: string,
  defaultProp: string,
  logger: Logger
): boolean => {
  const tokenValue = token[tokenProp];
  if (isNullOrUndefined(tokenValue)) {
    return false;
  }

  if (stateProp === tokenValue) {
    return false;
  }

  if (stateProp !== defaultProp) {
    logger.warn(
      `Mismatch on access token (JWT Token) ${tokenProp} and engine configuration.`
    );
    logger.warn(
      `To remove this warning, make sure that access token value: ${tokenValue} matches engine configuration value: ${stateProp}`
    );
  }
  logger.warn('WILL EXEC', tokenProp);
  return true;
};

const decodeJSONWebToken = (token: string): CoveoJSONWebToken | false => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
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
