import { v4 as uuidv4 } from "uuid";
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
    generateUUID: () => uuidv4(),
    storage: createNullStorage(),
  };
}
