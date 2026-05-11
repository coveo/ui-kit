import {CustomEnvironment} from '../environment/custom/custom.js';

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
   * The unique identifier of a web property. See [What's a tracking ID?](https://docs.coveo.com/en/n8tg0567/).
   * Can be null, in that case events are assigned to an internal default tracking ID.
   */
  trackingId: string | null;

  /**
   * Defines the library mode. The available modes are `emit` and `disabled`.
   * `emit` sends analytics events to Coveo to be stored.
   * `disabled` prevents the emission of events and does not trigger callbacks.
   * @default emit
   */
  mode?: 'emit' | 'disabled';

  /**
   * Optionally allows a Relay integration to specify the names of software packages relay is
   * being called from. These names will be transmitted with each event, along with Relay's own
   * version. The recommendation is to specify them using a 'softwarename@softwareversion' string.
   */
  source?: string[];

  /**
   * Optionally allows you to specify a custom environment for Relay, allowing integrations to override the default behavior.
   * This is useful when Relay runs in unsupported or specialized contexts that require custom handling.
   */
  environment?: CustomEnvironment;
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
    ...(!!rest.mode && {mode: rest.mode}),
    ...(!!rest.source && {source: rest.source}),
    ...(!!rest.environment && {environment: rest.environment}),
  });
}

export function createConfigManager(
  initialConfig: RelayConfig
): Readonly<ConfigManager> {
  let _config: Readonly<RelayConfig> = pick(initialConfig);

  return {
    get: () => _config,
    update: (updatedConfig: Partial<RelayConfig>) => {
      _config = pick({..._config, ...updatedConfig});
    },
  };
}
