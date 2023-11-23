import { RelayEvent } from "../../event/relay-event";
import { Environment } from "../environment";
import { createNullStorage } from "../storage";
import { fetchAPI } from "../utils/fetch";

export function buildNodeEnvironment(): Environment {
  return {
    runtime: "node",
    fetch: (url: string, init?: RequestInit) => fetchAPI(url, init),
    send: async (url: string, token: string, event: RelayEvent) => {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      fetchAPI(url, {
        method: "POST",
        body: JSON.stringify([event]),
        headers,
      });
    },
    getReferrer: () => null,
    getLocation: () => null,
    getUserAgent: () => null,
    generateUUID: () => crypto.randomUUID(),
    storage: createNullStorage(),
  };
}
