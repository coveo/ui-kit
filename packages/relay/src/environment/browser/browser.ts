import { Environment } from "../environment";

export function buildBrowserEnvironment(): Environment {
  return {
    runtime: "browser",
    getReferrer: () => document.referrer,
  };
}
