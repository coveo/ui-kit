import { Environment } from "../environment";

function getReferrerUrl() {
  const referrer = document.referrer;

  return referrer === "" ? null : referrer;
}

export function buildBrowserEnvironment(): Environment {
  return {
    runtime: "browser",
    getReferrerUrl: () => getReferrerUrl(),
    getUrl: () => window.location.href,
    getUserAgent: () => navigator.userAgent,
  };
}
