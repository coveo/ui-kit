import { v4 as uuidv4 } from "uuid";
import { Environment } from "../environment";
import { createBrowserStorage } from "./storage/storage";

function getReferrerUrl() {
  const referrer = document.referrer;

  return referrer === "" ? null : referrer;
}

export function buildBrowserEnvironment(): Environment {
  return {
    runtime: "browser",
    fetch: (url: string, init?: RequestInit) => fetch(url, init),
    getReferrerUrl: () => getReferrerUrl(),
    getUrl: () => window.location.href,
    getUserAgent: () => navigator.userAgent,
    generateUUID: () => uuidv4(),
    storage: createBrowserStorage(),
  };
}
