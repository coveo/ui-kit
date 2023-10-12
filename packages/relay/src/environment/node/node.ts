import { Environment } from "../environment";
import { createNullStorage } from "../storage";
import { fetchAPI } from "../utils/fetch";

export function buildNodeEnvironment(): Environment {
  return {
    runtime: "node",
    fetch: (url: string, init?: RequestInit) => fetchAPI(url, init),
    getReferrerUrl: () => null,
    getUrl: () => null,
    getUserAgent: () => null,
    generateUUID: () => crypto.randomUUID(),
    storage: createNullStorage(),
  };
}
