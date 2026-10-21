import type {SessionRequest} from '@coveo/thermidor';
import type {SessionRequestSource} from '../a2ui/session-request.js';

interface UserActionMessage {
  userAction?: {name?: unknown; surfaceId?: unknown; sourceComponentId?: unknown};
}

/**
 * A stand-in for the session's request handling: sends one message at a time through `send`,
 * withholds a message dispatched while another is in flight, and exposes `request` and
 * `sendAndWait()` like `Session` does.
 */
export function createFakeSessionRequests(send: (message: never) => Promise<void> | void) {
  const listeners = new Set<() => void>();
  let request: SessionRequest | undefined;
  let settledRequests = 0;

  const notify = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  const source: SessionRequestSource = {
    get request() {
      return request;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    sendAndWait(sendGesture) {
      const settledAt = settledRequests;
      const answered = new Promise<void>((resolve) => {
        const listener = () => {
          if (settledRequests > settledAt && request === undefined) {
            listeners.delete(listener);
            resolve();
          }
        };
        listeners.add(listener);
      });
      sendGesture();
      return answered;
    },
  };

  const dispatch = async (message: unknown): Promise<void> => {
    if (request) {
      settledRequests += 1;
      notify();
      return;
    }
    const userAction = (message as UserActionMessage).userAction;
    request =
      (message as {name?: unknown}).name === 'submitPrompt'
        ? {kind: 'prompt', turnId: 'turn'}
        : {
            kind: 'action',
            name: String(userAction?.name),
            surfaceId: String(userAction?.surfaceId),
            sourceComponentId: String(userAction?.sourceComponentId),
            turnId: 'turn',
          };
    notify();
    try {
      await (send as (message: unknown) => Promise<void> | void)(message);
    } catch {
      // Like the session's dispatch, a failed send still ends the request.
    }
    request = undefined;
    settledRequests += 1;
    notify();
  };

  return {source, dispatch};
}
