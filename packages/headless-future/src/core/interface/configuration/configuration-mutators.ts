import * as configurationActions from '@/src/core/internal/configuration/configuration-actions.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import type {ConfigurationState} from './configuration-types.js';

export const setOrganizationId = (organizationId: string): StateMutation => {
  return configurationActions.setOrganizationId(organizationId);
};

export const setAccessToken = (accessToken: string): StateMutation => {
  return configurationActions.setAccessToken(accessToken);
};

export const setTrackingId = (trackingId: string): StateMutation => {
  return configurationActions.setTrackingId(trackingId);
};

export const setLanguage = (language: string): StateMutation => {
  return configurationActions.setLanguage(language);
};

export const setCountry = (country: string): StateMutation => {
  return configurationActions.setCountry(country);
};

export const setCurrency = (currency: string): StateMutation => {
  return configurationActions.setCurrency(currency);
};

export const setEndpoint = (endpoint: string | undefined): StateMutation => {
  return configurationActions.setEndpoint(endpoint);
};

export const setConfiguration = (config: ConfigurationState): StateMutation => {
  return configurationActions.setConfiguration(config);
};
