import {createStaleScopes, type StaleScopes} from '@/src/optimistic/stale-scope.js';
import type {DispatchQueue, GestureDeclaration} from '@/src/optimistic/optimistic-value.js';
import type {IssuedDispatch} from '@/src/actions/dispatch-coordinator.js';

/**
 * The source of dispatches this tracker drives — the session's own coordinator, narrowed to the
 * two members the tracker uses. `Session.actions` satisfies it as-is.
 *
 * Kept generic over the message so a test can bind a bare coordinator without a session around it.
 */
export interface DispatchSource<TMessage> {
  /** Queues one dispatch and returns its identity before any send happens. */
  issue: (message: TMessage, intent?: GestureDeclaration['coalesce']) => IssuedDispatch;
  /** The one dispatch already sent, read at the moment it is needed rather than republished. */
  getSnapshot: () => {inFlight: IssuedDispatch['id'] | undefined};
}

/**
 * The dispatch coordination a view layer binds to: the {@link DispatchQueue} the optimistic
 * controller reads, plus the stale regions a view dims.
 */
export interface DispatchTracker<TMessage> extends DispatchQueue {
  /**
   * Issues one dispatch through the source and marks the regions it leaves behind until it
   * settles, then resolves once that dispatch has settled. The single handler the renderer's
   * `onAction` bridge is wired to, so every dispatch — the ones a gesture declared something for
   * and the plain `showMoreValues` that declared nothing — goes through one queue and marks the
   * regions it invalidates.
   */
  dispatch: (message: TMessage) => Promise<void>;
  /** Which regions of the screen the producer has not caught up with. */
  readonly stale: StaleScopes;
}

/**
 * Binds the session's dispatch coordination into one place: it owns the stale-region store, holds
 * the declaration the renderer forces onto the NEXT dispatch, and remembers the last dispatch
 * issued — the three pieces the optimistic controller reads back through {@link DispatchQueue},
 * none of which a renderer `onAction` call can carry on its own.
 *
 * Invalidation is EXPLICIT PER GESTURE: a dispatch marks a region stale only if the gesture that
 * sent it declared `invalidates: ['results']`; a dispatch that declares nothing marks nothing. The
 * facet-search and show-more/less gestures the producer answers without rebuilding the result set
 * declare nothing, so they leave every region untouched.
 *
 * Framework-agnostic: a view layer wraps this in whatever its store protocol is (React's
 * `useSyncExternalStore` over `stale.subscribe`), and injects nothing of itself here.
 */
export function createDispatchTracker<TMessage>(
  source: DispatchSource<TMessage>
): DispatchTracker<TMessage> {
  const stale = createStaleScopes();
  let declared: GestureDeclaration | undefined;
  let lastIssuedDispatch: IssuedDispatch | undefined;

  async function dispatch(message: TMessage): Promise<void> {
    const declaration = declared;

    // Issued synchronously, so the gesture that caused this call can read the identity as soon as
    // its own `context.dispatchAction(...)` returns.
    const issued = source.issue(message, declaration?.coalesce);
    lastIssuedDispatch = issued;

    // The settlement is registered BEFORE the regions are marked, so a dispatch that is already
    // over — dropped against another, or produced by the request on its way — marks nothing at all
    // rather than something the very next line immediately takes back.
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
