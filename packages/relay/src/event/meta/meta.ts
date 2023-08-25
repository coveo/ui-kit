import { Environment } from "../../environment/environment";
import { RelayOptions } from "../../relay";

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

/**
 * @todo LENS-1130: Hardcoded source value at the moment.
 * The Relay current version should be injected during bundle time.
 */
function getSource(): string {
  return `relay@0.0.5`;
}

/**
 * @todo LENS-1059: the clientId is currently a static value.
 * In the future, it should be a value that is generated and persisted during the user's session.
 */

export function createMeta(
  type: string,
  options: RelayOptions,
  environment: Environment
): Readonly<Meta> {
  const { getReferrerUrl, getUrl, getUserAgent } = environment;
  const config = getConfig(options);

  return {
    type,
    config,
    ts: Date.now(),
    source: getSource(),
    clientId: "2136b353-74be-42d7-904f-ea33a8f4a43c",
    userAgent: getUserAgent(),
    referrerUrl: getReferrerUrl(),
    url: getUrl(),
  };
}
