import { buildBrowserEnvironment } from "./browser/browser";
import { buildNodeEnvironment } from "./node/node";

export interface Environment {
  runtime: "browser" | "node";
  fetch: (url: string, init?: RequestInit) => Promise<Response>;
  getReferrerUrl: () => string | null;
  getUrl: () => string | null;
  getUserAgent: () => string | null;
  generateUUID: () => string;
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
