export type RelayMode = "emit" | "validate" | "disabled";

export interface RelayConfig {
  /**
   * Endpoint defined to communicate with the Event API.
   */
  url: string;

  /**
   * Token to authorize the access to the Event API endpoint.
   */
  token: string;

  /**
   * The unique identifier of a web property. See [Tracking ID](https://docs.coveo.com/en/n8tg0567/).
   */
  trackingId: string;

  /**
   * Defines the library mode. The possible values are:
   * "emit": Sends analytics events to Coveo to be stored.
   * "validate": Validates events without storing them. This mode is for debugging and development purposes only and should not be used in production.
   * "disabled": Prevents the emission of events and does not trigger callbacks.
   * @default emit
   */
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
