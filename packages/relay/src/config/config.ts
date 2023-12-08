export type RelayMode = "emit" | "disabled";

/**
 * The `RelayConfig` object defines the configuration options for initializing a Relay instance.
 */
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
   * "disabled": Prevents the emission of events and does not trigger callbacks.
   * @default emit
   */
  mode?: RelayMode;

  /**
   * Optionally allows a Relay integration to specify the name(s) of software package(s) relay is
   * being called from. These names will be transmitted with each event, along with Relay's own
   * version. The recommendation is to specify them using a 'softwarename@softwareversion' string.
   */
  source?: string[];
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
    ...(!!rest.source && { source: rest.source }),
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
