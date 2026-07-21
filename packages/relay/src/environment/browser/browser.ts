import {createExplorerMessenger} from '@coveo/explorer-messenger';
import type {Environment} from '../environment.js';
import {createBrowserStorage} from './storage/storage.js';
import type {RelayEvent} from '../../event/relay-event.js';
import {v4 as uuidv4, validate} from 'uuid';
import {clientIdKey} from '../../constants.js';

function getReferrer(): string | null {
  const referrer = document.referrer;

  return referrer === '' ? null : referrer;
}

type EventServiceResponseModel = {
  events: Array<{
    accepted: boolean;
    errorCode: string;
    errorMessage: string;
  }>;
};

export function buildBrowserEnvironment(): Environment {
  const storage = createBrowserStorage();

  return {
    runtime: 'browser',
    send: async (url: string, token: string, event: RelayEvent) => {
      const fetchPromise = fetch(url, {
        method: 'POST',
        body: JSON.stringify([event]),
        keepalive: true,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const messenger = createExplorerMessenger();
      messenger.sendMessage({kind: 'EVENT_PROTOCOL', event, url, token});

      const fetchResponse = await fetchPromise;
      if (!fetchResponse?.ok) {
        throw new Error(
          `Error ${fetchResponse.status}: Failed to send the event(s).`
        );
      } else {
        let response: EventServiceResponseModel;
        try {
          response = await fetchResponse.json();
        } catch {
          return;
        }
        for (const eventResponse of response.events) {
          if (!eventResponse.accepted) {
            throw new Error(
              `Received event was rejected for processing: ${eventResponse.errorMessage}`
            );
          }
        }
      }
    },
    getReferrer: () => getReferrer(),
    getLocation: () => window.location.href,
    getUserAgent: () => navigator.userAgent,
    getClientId: () => {
      const existing = storage.getItem(clientIdKey);
      if (existing && validate(existing)) {
        return existing;
      }
      const id = uuidv4();
      storage.setItem(clientIdKey, id);
      return id;
    },
  };
}
