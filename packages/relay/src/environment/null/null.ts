import { Environment } from "../environment";
import { createNullStorage } from "../storage";

export function buildNullEnvironment(): Environment {
  return {
    runtime: "null",
    fetch: () => Promise.resolve(new Response(JSON.stringify(""))),
    send: async () => null,
    getReferrer: () => null,
    getLocation: () => null,
    getUserAgent: () => null,
    generateUUID: () => "",
    storage: createNullStorage(),
  };
}
