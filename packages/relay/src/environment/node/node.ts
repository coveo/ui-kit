import { v4 as uuidv4 } from "uuid";
import { Environment } from "../environment";
import { createNullStorage } from "../storage";

export function buildNodeEnvironment(): Environment {
  return {
    runtime: "node",
    fetch: (url: string, init?: RequestInit) => fetch(url, init),
    getReferrerUrl: () => null,
    getUrl: () => null,
    getUserAgent: () => null,
    generateUUID: () => uuidv4(),
    storage: createNullStorage(),
  };
}
