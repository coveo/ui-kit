import { Environment } from "../environment";

export function buildBrowserEnvironment(): Environment {
  return {
    getReferrer: () => document.referrer,
  };
}
