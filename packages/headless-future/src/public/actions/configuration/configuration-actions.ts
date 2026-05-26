import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import * as configurationMutators from '@/src/core/interface/configuration/configuration-mutators.js';
import {configurationSlice} from '@/src/core/internal/configuration/configuration-slice.js';
import type {ConfigurationState} from '@/src/core/interface/configuration/configuration-types.js';

type MutatorToAction<T> = T extends (...args: infer A) => any
  ? (...args: A) => void
  : never;

type MutatorsToActions<T> = {
  [K in keyof T]: MutatorToAction<T[K]>;
};

const loadedEngine = new WeakSet<Engine>();

const ensureLoaded = (engine: Engine) => {
  if (loadedEngine.has(engine)) {
    return;
  }

  const fullEngine = getFullEngine(engine);
  fullEngine.adoptSlice(configurationSlice);
  loadedEngine.add(engine);
};

export const loadConfigurationActions = (
  engine: Engine
): MutatorsToActions<typeof configurationMutators> => {
  ensureLoaded(engine);
  const fullEngine = getFullEngine(engine);

  return {
    setOrganizationId: (organizationId: string) => {
      fullEngine.mutate(
        configurationMutators.setOrganizationId(organizationId)
      );
    },
    setAccessToken: (accessToken: string) => {
      fullEngine.mutate(configurationMutators.setAccessToken(accessToken));
    },
    setTrackingId: (trackingId: string) => {
      fullEngine.mutate(configurationMutators.setTrackingId(trackingId));
    },
    setLanguage: (language: string) => {
      fullEngine.mutate(configurationMutators.setLanguage(language));
    },
    setCountry: (country: string) => {
      fullEngine.mutate(configurationMutators.setCountry(country));
    },
    setCurrency: (currency: string) => {
      fullEngine.mutate(configurationMutators.setCurrency(currency));
    },
    setEndpoint: (endpoint: string | undefined) => {
      fullEngine.mutate(configurationMutators.setEndpoint(endpoint));
    },
    setConfiguration: (config: ConfigurationState) => {
      fullEngine.mutate(configurationMutators.setConfiguration(config));
    },
  };
};
