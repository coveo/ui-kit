import { ConfigManager, RelayConfig } from "../config/config";

export function createMockConfig(config?: Partial<RelayConfig>): RelayConfig {
  return {
    url: "https://platform.cloud.coveo.com",
    token: "I am token",
    trackingId: "website",
    ...config,
  };
}

export function createMockConfigManager(
  manager?: Partial<ConfigManager>
): ConfigManager {
  return {
    get: () => createMockConfig(),
    update: () => jest.fn(),
    ...manager,
  };
}
