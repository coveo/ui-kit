import type {SessionRequest} from '@coveo/thermidor';
import type {SessionRequestSource} from '../a2ui/session-request.js';

interface UserActionMessage {
  userAction?: {name?: unknown; surfaceId?: unknown; sourceComponentId?: unknown};
}

/**
 * A stand-in for the session's request chain: sends one message at a time through `send`, in
 * order, and exposes `request` and `whenSettled()` like `Session` does.
 */
export function createFakeSessionRequests(send: (message: never) => Promise<void> | void) {
  const listeners = new Set<() => void>();
  const waiting: Array<{request: SessionRequest; message: unknown; settle: () => void}> = [];
  let request: SessionRequest | undefined;
  let settledRequests = 0;
  let sending = false;

  const notify = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  async function sendWaiting() {
    if (sending) {
      return;
    }
    sending = true;
    let next = waiting.shift();
    request = next?.request;
    notify();
    while (next) {
      try {
        await (send as (message: unknown) => Promise<void> | void)(next.message);
      } catch {
        // Like the session's dispatch, a failed send still ends the request.
      }
      const following = waiting.shift();
      request = following?.request;
      settledRequests += 1;
      notify();
      next.settle();
      next = following;
    }
    sending = false;
  }

  const source: SessionRequestSource = {
    get request() {
      return request;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    whenSettled() {
      const settledAt = settledRequests;
      return new Promise((resolve) => {
        const listener = () => {
          if (settledRequests > settledAt && request === undefined) {
            listeners.delete(listener);
            resolve();
          }
        };
        listeners.add(listener);
      });
    },
  };

  const dispatch = (message: unknown): Promise<void> => {
    const userAction = (message as UserActionMessage).userAction;
    const nextRequest: SessionRequest =
      (message as {name?: unknown}).name === 'submitPrompt'
        ? {kind: 'prompt', turnId: 'turn'}
        : {
            kind: 'action',
            name: String(userAction?.name),
            surfaceId: String(userAction?.surfaceId),
            sourceComponentId: String(userAction?.sourceComponentId),
            turnId: 'turn',
          };
    return new Promise((settle) => {
      waiting.push({request: nextRequest, message, settle});
      void sendWaiting();
    });
  };

  return {source, dispatch};
}
