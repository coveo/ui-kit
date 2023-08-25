import { Environment } from "../environment";

export function buildNodeEnvironment(): Environment {
  return {
    runtime: "node",
    fetch: (url: string, init?: RequestInit) => fetch(url, init),
    getReferrerUrl: () => null,
    getUrl: () => null,
    getUserAgent: () => null,
  };
}
