import {
  setOrganizationId as _setOrganizationId,
  setAccessToken as _setAccessToken,
  setTrackingId as _setTrackingId,
  setLanguage as _setLanguage,
  setCountry as _setCountry,
  setCurrency as _setCurrency,
  setEndpoint as _setEndpoint,
  setConfiguration as _setConfiguration,
} from '@/src/core/internal/configuration/configuration-actions.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import type {ConfigurationState} from './configuration-types.js';

export const setOrganizationId = (organizationId: string): StateMutation => {
  return _setOrganizationId(organizationId);
};

export const setAccessToken = (accessToken: string): StateMutation => {
  return _setAccessToken(accessToken);
};

export const setTrackingId = (trackingId: string): StateMutation => {
  return _setTrackingId(trackingId);
};

export const setLanguage = (language: string): StateMutation => {
  return _setLanguage(language);
};

export const setCountry = (country: string): StateMutation => {
  return _setCountry(country);
};

export const setCurrency = (currency: string): StateMutation => {
  return _setCurrency(currency);
};

export const setEndpoint = (endpoint: string | undefined): StateMutation => {
  return _setEndpoint(endpoint);
};

export const setConfiguration = (config: ConfigurationState): StateMutation => {
  return _setConfiguration(config);
};
