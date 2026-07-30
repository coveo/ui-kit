import {Engine, getFullEngine} from '@/src/internal/engine/index.js';
import {
  setOrganizationId,
  setAccessToken,
  setTrackingId,
  setLanguage,
  setCountry,
  setCurrency,
  setEndpoint,
  setConfiguration,
  configurationSlice,
} from '@/src/internal/features/configuration/index.js';
import type {ConfigurationState} from '@/src/internal/features/configuration/index.js';

export interface ConfigurationActions {
  setOrganizationId: (organizationId: string) => void;
  setAccessToken: (accessToken: string) => void;
  setTrackingId: (trackingId: string) => void;
  setLanguage: (language: string) => void;
  setCountry: (country: string) => void;
  setCurrency: (currency: string) => void;
  setEndpoint: (endpoint: string | undefined) => void;
  setConfiguration: (config: ConfigurationState) => void;
}

const loadedEngine = new WeakSet<Engine>();

const ensureLoaded = (engine: Engine) => {
  if (loadedEngine.has(engine)) {
    return;
  }

  const fullEngine = getFullEngine(engine);
  fullEngine.adoptSlice(configurationSlice);
  loadedEngine.add(engine);
};

export const loadConfigurationActions = (engine: Engine): ConfigurationActions => {
  ensureLoaded(engine);
  const fullEngine = getFullEngine(engine);

  return {
    setOrganizationId: (organizationId: string) => {
      fullEngine.mutate(setOrganizationId(organizationId));
    },
    setAccessToken: (accessToken: string) => {
      fullEngine.mutate(setAccessToken(accessToken));
    },
    setTrackingId: (trackingId: string) => {
      fullEngine.mutate(setTrackingId(trackingId));
    },
    setLanguage: (language: string) => {
      fullEngine.mutate(setLanguage(language));
    },
    setCountry: (country: string) => {
      fullEngine.mutate(setCountry(country));
    },
    setCurrency: (currency: string) => {
      fullEngine.mutate(setCurrency(currency));
    },
    setEndpoint: (endpoint: string | undefined) => {
      fullEngine.mutate(setEndpoint(endpoint));
    },
    setConfiguration: (config: ConfigurationState) => {
      fullEngine.mutate(setConfiguration(config));
    },
  };
};
