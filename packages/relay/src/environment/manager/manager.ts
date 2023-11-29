import { ConfigManager } from "../../config/config";
import { Environment, currentEnvironment } from "../environment";
import { buildNullEnvironment } from "../null/null";

export interface EnvironmentManager {
  get: () => Readonly<Environment>;
}

function buildEnvironment(configManager: ConfigManager) {
  return configManager.get().mode == "disabled"
    ? buildNullEnvironment()
    : currentEnvironment();
}

export function createEnvironmentManager(
  configManager: ConfigManager
): Readonly<EnvironmentManager> {
  return {
    get: () => Object.freeze(buildEnvironment(configManager)),
  };
}
