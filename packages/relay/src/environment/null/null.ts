import { Environment } from "../environment";
import { createNullStorage } from "../storage";

export function buildNullEnvironment(): Environment {
  return {
    runtime: "null",
    send: async () => undefined,
    getReferrer: () => null,
    getLocation: () => null,
    getUserAgent: () => null,
    generateUUID: () => "",
    storage: createNullStorage(),
  };
}
