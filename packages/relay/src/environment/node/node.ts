import { Environment } from "../environment";

export function buildNodeEnvironment(): Environment {
  return {
    runtime: "node",
    getReferrerUrl: () => null,
    getUrl: () => null,
    getUserAgent: () => null,
  };
}
