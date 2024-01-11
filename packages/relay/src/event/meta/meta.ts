import { ClientIdManager } from "../../client-id/client-id";
import { Environment } from "../../environment/environment";
import { RelayConfig, User } from "../../config/config";
import { version } from "../../version";

/**
 * The `EventConfig` object provides additonal information for the configuration associated with the event.
 */
export interface EventConfig {
  /**
   * The unique identifier of a web property. See [Tracking ID](https://docs.coveo.com/en/n8tg0567/).
   */
  trackingId: string;

  /**
   * Named user identity which logged this event.
   */
  user: User | null;
}

/**
 * The `Meta` object provides a structured representation of metadata associated with an emitted event.
 * This object is auto-populated by Relay.
 */
export interface Meta {
  /**
   * Event's type that was emitted.
   */
  type: string;

  /**
   * Configuration associated with the event.
   */
  config: EventConfig;

  /**
   * Timestamp when the event was emitted.
   */
  ts: number;

  /**
   * Names and versions of the client side libraries which built and emitted this event.
   */
  source: string[];

  /**
   * Persistent unique identifier of a device.
   */
  clientId: string;

  /**
   * Browser Navigator's [user agent](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/userAgent) property if set.
   */
  userAgent: string | null;

  /**
   * Browser Document's [referrer](https://developer.mozilla.org/en-US/docs/Web/API/Document/referrer) property if set.
   */
  referrer: string | null;

  /**
   * Browser Location's [href](https://developer.mozilla.org/en-US/docs/Web/API/Location/href) property if set.
   */
  location: string | null;
}

function getEventConfig(config: RelayConfig): EventConfig {
  const { trackingId } = config;
  return { trackingId, user: null };
}

function getSource(config: RelayConfig): string[] {
  return (config.source || []).concat([`relay@${version}`]);
}

export function createMeta(
  type: string,
  config: RelayConfig,
  environment: Environment,
  clientIdManager: ClientIdManager
): Readonly<Meta> {
  const { getReferrer, getLocation, getUserAgent } = environment;
  const eventConfig = getEventConfig(config);
  const clientId = clientIdManager.getClientId();

  return Object.freeze<Meta>({
    type,
    config: eventConfig,
    ts: Date.now(),
    source: getSource(config),
    clientId,
    userAgent: getUserAgent(),
    referrer: getReferrer(),
    location: getLocation(),
  });
}
