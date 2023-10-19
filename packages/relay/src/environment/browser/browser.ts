import { Environment } from "../environment";
import { createBrowserStorage } from "./storage/storage";
import { fetchAPI } from "../utils/fetch";

function getReferrerUrl() {
  const referrer = document.referrer;

  return referrer === "" ? null : referrer;
}

export function buildBrowserEnvironment(): Environment {
  return {
    runtime: "browser",
    fetch: (url: string, init?: RequestInit) => fetchAPI(url, init),
    send: async (url: string, token: string, body: string) => {
      const response = navigator.sendBeacon(
        `${url}?access_token=${token}`,
        new Blob([body], {
          type: "application/json",
        })
      );

      if (!response) {
        throw new Error(
          `Failed to send the event(s) because the payload size exceeded the maximum allowed size (32 KB). Please contact support if the problem persists.`
        );
      }

      return null;
    },
    getReferrerUrl: () => getReferrerUrl(),
    getUrl: () => window.location.href,
    getUserAgent: () => navigator.userAgent,
    generateUUID: () => crypto.randomUUID(),
    storage: createBrowserStorage(),
  };
}
