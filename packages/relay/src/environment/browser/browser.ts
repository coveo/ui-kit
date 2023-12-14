import { createExplorerMessenger } from "@coveo/explorer-messenger";
import { Environment } from "../environment";
import { createBrowserStorage } from "./storage/storage";
import { RelayEvent } from "../../event/relay-event";

function getReferrer() {
  const referrer = document.referrer;

  return referrer === "" ? null : referrer;
}

export function buildBrowserEnvironment(): Environment {
  return {
    runtime: "browser",
    send: async (url: string, token: string, event: RelayEvent) => {
      const response = navigator.sendBeacon(
        `${url}?access_token=${token}`,
        new Blob([JSON.stringify([event])], {
          type: "application/json",
        })
      );

      const messenger = createExplorerMessenger();
      messenger.sendMessage({ kind: "EVENT_PROTOCOL", event, url, token });

      if (!response) {
        throw new Error(
          `Failed to send the event(s) because the payload size exceeded the maximum allowed size (32 KB). Please contact support if the problem persists.`
        );
      }
    },
    getReferrer: () => getReferrer(),
    getLocation: () => window.location.href,
    getUserAgent: () => navigator.userAgent,
    generateUUID: () => crypto.randomUUID(),
    storage: createBrowserStorage(),
  };
}
