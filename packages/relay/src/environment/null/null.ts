import type { Environment } from "../environment.js";
import { createNullStorage } from "../storage.js";

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
