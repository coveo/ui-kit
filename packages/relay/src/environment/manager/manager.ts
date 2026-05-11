import type {ConfigManager} from '../../config/config.js';
import {buildBrowserEnvironment} from '../browser/browser.js';
import {localStorageAvailable} from '../browser/storage/availability.js';
import type {Environment} from '../environment.js';
import {buildNullEnvironment} from '../null/null.js';

export interface EnvironmentManager {
  get: () => Readonly<Environment>;
}

function buildEnvironment(configManager: ConfigManager): Environment {
  const active = configManager.get().mode !== 'disabled';

  const environmentFromConfig = configManager.get().environment;
  const nullEnvironment = buildNullEnvironment();

  if (active && environmentFromConfig) {
    return {
      ...environmentFromConfig,
      runtime: 'custom',
    };
  }

  if (active && isBrowser() && localStorageAvailable()) {
    return buildBrowserEnvironment();
  }

  return nullEnvironment;
}

function isBrowser() {
  try {
    return typeof window === 'object';
  } catch {
    return false;
  }
}

export function createEnvironmentManager(
  configManager: ConfigManager
): Readonly<EnvironmentManager> {
  return {
    get: () => Object.freeze(buildEnvironment(configManager)),
  };
}
