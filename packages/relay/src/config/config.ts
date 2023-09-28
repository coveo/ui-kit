export type RelayMode = "emit" | "validate";

export interface RelayConfig {
  url: string;
  token: string;
  trackingId: string;
  mode?: RelayMode;
}

export interface ConfigManager {
  get: () => Readonly<RelayConfig>;
  update: (updatedConfig: Partial<RelayConfig>) => void;
}

function pick({
  url,
  token,
  trackingId,
  ...rest
}: RelayConfig): Readonly<RelayConfig> {
  return Object.freeze({
    url,
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
