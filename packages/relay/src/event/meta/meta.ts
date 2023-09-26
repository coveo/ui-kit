import { ClientIdManager } from "../../client-id/client-id";
import { Environment } from "../../environment/environment";
import { RelayOptions } from "../../relay";
import { version } from "../../version";

interface Config {
  trackingId: string;
}

export interface Meta {
  type: string;
  config: Config;
  ts: number;
  source: string;
  clientId: string;
  userAgent: string | null;
  referrerUrl: string | null;
  url: string | null;
}

function getConfig(options: RelayOptions): Config {
  const { trackingId } = options;
  return { trackingId };
}

function getSource(): string {
  return `relay@${version}`;
}

export function createMeta(
  type: string,
  options: RelayOptions,
  environment: Environment,
  clientIdManager: ClientIdManager
): Readonly<Meta> {
  const { getReferrerUrl, getUrl, getUserAgent } = environment;
  const config = getConfig(options);
  const { clientId } = clientIdManager;

  return Object.freeze({
    type,
    config,
    ts: Date.now(),
    source: getSource(),
    clientId,
    userAgent: getUserAgent(),
    referrerUrl: getReferrerUrl(),
    url: getUrl(),
  });
}
