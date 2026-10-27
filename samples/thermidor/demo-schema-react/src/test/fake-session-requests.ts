import type {SessionRequest, SessionSnapshot} from '@coveo/thermidor';
import type {SessionRequestSource} from '../a2ui/session-request.js';

/** A session snapshot holding only `request`, the one field the surfaces read. */
export function requestSnapshot(request: SessionRequest | undefined): SessionSnapshot {
  return {
    turns: [],
    initialization: undefined,
    surfaces: [],
    a2uiMessages: [],
    state: {},
    request,
    actionError: undefined,
  };
}

interface UserActionMessage {
  userAction?: {name?: unknown; surfaceId?: unknown; sourceComponentId?: unknown};
}

/**
 * A stand-in for the session's request handling: sends one message at a time through `send`,
 * withholds a message dispatched while another is in flight, and exposes `request` through
 * `getSnapshot()`, and `sendAndWait()`, like `Session` does. `componentOf` gives the `component`
 * of a dispatching node, which the session reads from the surface.
 */
export function createFakeSessionRequests(
  send: (message: never) => Promise<void> | void,
  componentOf: (sourceComponentId: string) => string
) {
  const listeners = new Set<() => void>();
  let request: SessionRequest | undefined;
  let snapshot = requestSnapshot(undefined);

  const notify = () => {
    snapshot = requestSnapshot(request);
    for (const listener of listeners) {
      listener();
    }
  };

  const source: SessionRequestSource = {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    sendAndWait(sendGesture) {
      sendGesture();
      return new Promise((resolve) => {
        const listener = () => {
          if (request === undefined) {
            listeners.delete(listener);
            resolve();
          }
        };
        listeners.add(listener);
        listener();
      });
    },
  };

  const dispatch = async (message: unknown): Promise<void> => {
    if (request) {
      return;
    }
    const userAction = (message as UserActionMessage).userAction;
    request =
      (message as {name?: unknown}).name === 'submitPrompt'
        ? {kind: 'prompt', turnId: 'turn'}
        : {
            kind: 'action',
            component: componentOf(String(userAction?.sourceComponentId)),
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
    notify();
  };

  return {source, dispatch};
}
