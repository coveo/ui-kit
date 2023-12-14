import { ConfigManager } from "../../config/config";
import { buildBrowserEnvironment } from "../browser/browser";
import { Environment } from "../environment";
import { buildNullEnvironment } from "../null/null";

export interface EnvironmentManager {
  get: () => Readonly<Environment>;
}

function buildEnvironment(configManager: ConfigManager) {
  const active = configManager.get().mode !== "disabled";

  if (active && isBrowser()) {
    return buildBrowserEnvironment();
  }

  return buildNullEnvironment();
}

function isBrowser() {
  try {
    return typeof window === "object";
  } catch (e) {
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
