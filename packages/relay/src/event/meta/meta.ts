import { ClientIdManager } from "../../client-id/client-id";
import { Environment } from "../../environment/environment";
import { RelayConfig } from "../../config/config";
import { version } from "../../version";

interface EventConfig {
  /**
   * The unique identifier of a web property. See [Tracking ID](https://docs.coveo.com/en/n8tg0567/).
   */
  trackingId: string;
}

export interface Meta {
  /**
   * Event's type that was emitted.
   */
  type: string;
  config: EventConfig;

  /**
   * Timestamp when the event was emitted.
   */
  ts: number;

  /**
   * Library and version in which the event is built and emitted.
   */
  source: string;

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
  return { trackingId };
}

function getSource(): string {
  return `relay@${version}`;
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

  return Object.freeze({
    type,
    config: eventConfig,
    ts: Date.now(),
    source: getSource(),
    clientId,
    userAgent: getUserAgent(),
    referrer: getReferrer(),
    location: getLocation(),
  });
}
