import { RelayConfig } from "../config/config";

const defaultConfig: RelayConfig = {
  token: "I am token",
  organizationId: "my-org",
  host: "https://platform.cloud.coveo.com",
  trackingId: "website",
};

export function createMockConfig(config?: Partial<RelayConfig>): RelayConfig {
  return {
    ...defaultConfig,
    ...config,
  };
}
