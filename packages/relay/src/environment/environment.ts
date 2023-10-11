import { buildBrowserEnvironment } from "./browser/browser";
import { buildNodeEnvironment } from "./node/node";
import { Storage } from "./storage";

export interface Environment {
  runtime: "browser" | "node" | "null";
  fetch: (url: string, init?: RequestInit) => Promise<Response>;
  getReferrerUrl: () => string | null;
  getUrl: () => string | null;
  getUserAgent: () => string | null;
  generateUUID: () => string;
  storage: Storage;
}

export function currentEnvironment(): Environment {
  return isBrowser() ? buildBrowserEnvironment() : buildNodeEnvironment();
}

function isBrowser() {
  try {
    return typeof window === "object";
  } catch (e) {
    return false;
  }
}
