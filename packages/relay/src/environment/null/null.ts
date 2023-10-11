import { Environment } from "../environment";
import { createNullStorage } from "../storage";

export function buildNullEnvironment(): Environment {
  return {
    runtime: "null",
    fetch: () => Promise.resolve(new Response(JSON.stringify(""))),
    getReferrerUrl: () => null,
    getUrl: () => null,
    getUserAgent: () => null,
    generateUUID: () => "",
    storage: createNullStorage(),
  };
}
