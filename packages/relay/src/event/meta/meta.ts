import { ClientIdManager } from "../../client-id/client-id";
import { Environment } from "../../environment/environment";
import { RelayConfig } from "../../config/config";
import { version } from "../../version";

interface EventConfig {
  trackingId: string;
}

export interface Meta {
  type: string;
  config: EventConfig;
  ts: number;
  source: string;
  clientId: string;
  userAgent: string | null;
  referrerUrl: string | null;
  url: string | null;
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
  const { getReferrerUrl, getUrl, getUserAgent } = environment;
  const eventConfig = getEventConfig(config);
  const clientId = clientIdManager.getClientId();

  return Object.freeze({
    type,
    config: eventConfig,
    ts: Date.now(),
    source: getSource(),
    clientId,
    userAgent: getUserAgent(),
    referrerUrl: getReferrerUrl(),
    url: getUrl(),
  });
}
