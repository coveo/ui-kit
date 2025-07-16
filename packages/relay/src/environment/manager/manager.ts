import { ConfigManager } from "../../config/config";
import { buildBrowserEnvironment } from "../browser/browser";
import { localStorageAvailable } from "../browser/storage/availability";
import { Environment } from "../environment";
import { buildNullEnvironment } from "../null/null";

export interface EnvironmentManager {
  get: () => Readonly<Environment>;
}

function buildEnvironment(configManager: ConfigManager): Environment {
  const active = configManager.get().mode !== "disabled";

  const environmentFromConfig = configManager.get().environment;
  const nullEnvironment = buildNullEnvironment();

  if (active && environmentFromConfig) {
    return {
      storage: nullEnvironment.storage,
      ...environmentFromConfig,
      runtime: "custom",
    };
  }

  if (active && isBrowser() && localStorageAvailable()) {
    return buildBrowserEnvironment();
  }

  return nullEnvironment;
}

function isBrowser() {
  try {
    return typeof window === "object";
  } catch {
    return false;
  }
}

export function createEnvironmentManager(
  configManager: ConfigManager,
): Readonly<EnvironmentManager> {
  return {
    get: () => Object.freeze(buildEnvironment(configManager)),
  };
}
