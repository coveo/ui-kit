export type RelayMode = "emit" | "validate";

export interface RelayConfig {
  host: string;
  organizationId: string;
  token: string;
  trackingId: string;
  mode?: RelayMode;
}

export interface ConfigManager {
  get: () => Readonly<RelayConfig>;
  update: (updatedConfig: Partial<RelayConfig>) => void;
}

function pick({
  host,
  organizationId,
  token,
  trackingId,
  ...rest
}: RelayConfig): Readonly<RelayConfig> {
  return Object.freeze({
    host,
    organizationId,
    token,
    trackingId,
    ...(!!rest.mode && { mode: rest.mode }),
  });
}

export function createConfigManager(
  initialConfig: RelayConfig
): Readonly<ConfigManager> {
  let _config: Readonly<RelayConfig> = pick(initialConfig);

  return {
    get: () => _config,
    update: (updatedConfig: Partial<RelayConfig>) => {
      _config = pick({ ..._config, ...updatedConfig });
    },
  };
}
