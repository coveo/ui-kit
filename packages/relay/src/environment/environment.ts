import { buildBrowserEnvironment } from "./browser/browser";
import { buildNodeEnvironment } from "./node/node";

export interface Environment {
  runtime: "browser" | "node";
  getReferrer: () => string | null;
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
