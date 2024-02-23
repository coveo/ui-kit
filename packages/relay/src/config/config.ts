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
   * The application's user identity. If not set in the config, Relay will assume the identity matches
   * the identity in the authentication or anonymous otherwise.
   */
  user?: User;

  /**
   * Defines the library mode. The available modes are `emit` and `disabled`.
   * `emit` sends analytics events to Coveo to be stored.
   * `disabled` prevents the emission of events and does not trigger callbacks.
   * @default emit
   */
  mode?: "emit" | "disabled";

  /**
   * Optionally allows a Relay integration to specify the name(s) of software package(s) relay is
   * being called from. These names will be transmitted with each event, along with Relay's own
   * version. The recommendation is to specify them using a 'softwarename@softwareversion' string.
   */
  source?: string[];
}

/**
 * User which logged the event.
 */
export interface User {
  /**
   * The application's user identifier. An id of 'anonymous' assumes the user is explicitly anonymous. An id of null indicates
   * the identity is equal to the identity in the authentication or anonymous.
   */
  id: string | null;
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
    ...(!!rest.user && { user: rest.user }),
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
