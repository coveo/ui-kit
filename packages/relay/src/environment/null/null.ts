import { Environment } from "../environment";
import { createNullStorage } from "../storage";

export function buildNullEnvironment(): Environment {
  return {
    runtime: "null",
    send: () => undefined,
    getReferrer: () => null,
    getLocation: () => null,
    getUserAgent: () => null,
    generateUUID: () => "",
    storage: createNullStorage(),
  };
}
