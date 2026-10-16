import {createStaleScopes, type StaleScopes} from '@/src/optimistic/stale-scope.js';
import type {DispatchQueue, GestureDeclaration} from '@/src/optimistic/optimistic-value.js';
import type {IssuedDispatch} from '@/src/actions/dispatch-coordinator.js';

/** Narrowed so `Session.actions` or a bare coordinator (in tests) satisfies it. */
export interface DispatchSource<TMessage> {
  issue: (message: TMessage, intent?: GestureDeclaration['coalesce']) => IssuedDispatch;
  getSnapshot: () => {inFlight: IssuedDispatch['id'] | undefined};
}

export interface DispatchTracker<TMessage> extends DispatchQueue {
  /** Marks the declared regions stale until the dispatch settles, then resolves. */
  dispatch: (message: TMessage) => Promise<void>;
  readonly stale: StaleScopes;
}

/** Invalidation is explicit per gesture: an undeclared dispatch marks no region stale. */
export function createDispatchTracker<TMessage>(
  source: DispatchSource<TMessage>
): DispatchTracker<TMessage> {
  const stale = createStaleScopes();
  let declared: GestureDeclaration | undefined;
  let lastIssuedDispatch: IssuedDispatch | undefined;

  async function dispatch(message: TMessage): Promise<void> {
    const declaration = declared;

    // Synchronous, so the gesture can read `lastIssued()` as soon as `dispatchAction` returns.
    const issued = source.issue(message, declaration?.coalesce);
    lastIssuedDispatch = issued;

    // Registered before tracking, so an already-settled dispatch never marks anything.
    let isSettled = false;
    issued.onSettled(() => {
      isSettled = true;
      stale.settle(issued.id);
    });
    if (!isSettled) {
      stale.track(issued.id, declaration?.invalidates ?? []);
    }

    await issued.settled;
  }

  function lastIssued(): IssuedDispatch | undefined {
    return lastIssuedDispatch;
  }

  function inFlight(): IssuedDispatch['id'] | undefined {
    return source.getSnapshot().inFlight;
  }

  function declareGesture(declaration: GestureDeclaration): () => void {
    declared = declaration;
    return () => {
      declared = undefined;
    };
  }

  return {dispatch, lastIssued, inFlight, declareGesture, stale};
}
