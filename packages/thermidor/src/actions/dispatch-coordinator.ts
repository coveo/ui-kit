/**
 * Client-side dispatch coordination: one action on its way at a time, with the gestures still
 * waiting droppable against each other.
 *
 * SCOPED FOR REMOVAL. This directory exists because the queue lives on the client today. Once the
 * producer owns it, the producer also owns the serialization and the dropping rules below — it
 * knows its own action algebra, where a client can only have each gesture declare it. Removing the
 * whole mechanism is: delete this directory, drop `Session.actions`, and have the action path chain
 * its sends again.
 *
 * Framework-agnostic on purpose. The queue's observable state is published as a store
 * (`subscribe` + `getSnapshot`), so a view layer binds to it the way it binds to any external
 * store, and this package keeps no view-layer dependency.
 */

/**
 * Identity of one dispatched action. Opaque on purpose: it says WHICH dispatch, never which
 * position in a queue, so nothing can come to depend on dispatches being answered in order.
 */
export type DispatchId = string;

/**
 * What the PRODUCER's handler does with this action — a property of the action, checkable against
 * that handler, from which this queue derives what may be dropped.
 *
 * Declared by the gesture that issues it rather than derived from the message here, because it
 * follows from the producer's algebra for that action and, for a flip, from state only the issuing
 * component holds. A central table keyed by action name would be betrayed in silence by the next
 * action added by analogy.
 */
export type CoalescePolicy =
  /** Writes the whole value whatever was queued ahead of it — `selectPage`, `selectSort`. */
  | 'absolute'
  /** Its own inverse: the same gesture queued twice may go as a pair — `toggleSelect`. */
  | 'involutive'
  /**
   * A delta, or an outcome that depends on the gestures queued ahead of it.
   *
   * It says what THIS gesture may drop, and buys it no protection from BEING dropped: an
   * `absolute` write behind it takes everything queued in the slot whatever those entries
   * declared. A gesture whose entry must survive — an append — is protected by the absolute
   * gesture declining to be absolute, which is what a guard at that call site is for.
   */
  | 'dependent';

export interface CoalesceIntent {
  /** The piece of producer state this dispatch writes. An absolute write drops within this scope. */
  slot: string;
  /** This exact gesture within the slot. An involutive gesture pairs on it. */
  gesture: string;
  policy: CoalescePolicy;
  /**
   * The dispatch already on its way produces the state this gesture wants, so no request has to go
   * out for it at all and the slot's queued gestures go with it.
   *
   * DERIVED, never declared by hand: deciding it takes both the gesture's transform and what the
   * sent request is going to land on, which `../optimistic/optimistic-value.ts` holds together. It
   * wins over `policy`, since there is nothing left to pair or to supersede for.
   */
  satisfiedByFlight?: boolean;
}

/**
 * Why a dispatch ended. Every one of these is terminal and delivered exactly once, so a caller
 * waiting on a dispatch is never left waiting — including in the four cases where no request was
 * ever sent.
 */
export type DispatchOutcome =
  /** Sent, and the producer's response has been consumed in full. */
  | 'answered'
  /** Sent, and the send threw. The dispatch is over; no response will arrive for it. */
  | 'failed'
  /** Never sent: the session had nothing to send it on, or refused the payload. */
  | 'withheld'
  /** Dropped while queued, against the gesture that exactly undoes it. */
  | 'cancelled'
  /** Dropped while queued, by an absolute write of the same slot. */
  | 'superseded'
  /** Not sent: the dispatch already on its way produces the state this gesture wanted. */
  | 'satisfied';

/**
 * One dispatch's identity together with its own settlement, so a caller can act when THAT dispatch
 * ends. A settlement is a positive event: watching an identity leave a published set of
 * outstanding dispatches cannot do this job, because the identity is missing both before the set
 * is published and after it has ended.
 */
export interface IssuedDispatch {
  id: DispatchId;
  /** Resolves with the outcome. Never rejects — a refused send is an outcome, not an error. */
  settled: Promise<DispatchOutcome>;
  /**
   * Called once this dispatch ends — immediately if it already has. Synchronous, so a listener's
   * own state update lands in the same batch as whatever caused the settlement.
   */
  onSettled: (listener: (outcome: DispatchOutcome) => void) => void;
}

export interface DispatchSnapshot {
  /**
   * The one dispatch already sent. It cannot be taken back, so a gesture issued now lands after
   * it — which is what makes it the only queue fact a caller needs.
   *
   * There is deliberately no set of outstanding identities here. Such a set answers "is this one
   * still outstanding?" wrongly in one direction: an identity is missing both before the set
   * reaches an observer and after it was answered, indistinguishably. The positive event is
   * {@link IssuedDispatch.onSettled}.
   */
  inFlight: DispatchId | undefined;
}

export interface DispatchCoordinator<TMessage> {
  /**
   * Queues one dispatch and returns its identity before any send happens, so the caller can tie
   * local state to it synchronously. `intent` declares what this dispatch may drop; omitting it
   * queues the dispatch and drops nothing.
   */
  issue: (message: TMessage, intent?: CoalesceIntent) => IssuedDispatch;
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => DispatchSnapshot;
}

export interface DispatchCoordinatorOptions {
  /**
   * Called with a one-line record of every queue transition (`send`, `queued`, `cancelled`,
   * `superseded`, `satisfied`, `answered`). Supplied by the consumer so this package decides
   * nothing about when tracing is on; omitted, nothing is traced. Queue depth is included on
   * `queued`, because dropping can only ever pay from a depth of two on the same slot.
   */
  trace?: (...parts: unknown[]) => void;
}

interface QueuedDispatch<TMessage> {
  id: DispatchId;
  message: TMessage;
  slot: string | undefined;
  gesture: string | undefined;
  settle: (outcome: DispatchOutcome) => void;
}

interface Settlement {
  issued: IssuedDispatch;
  settle: (outcome: DispatchOutcome) => void;
}

function createSettlement(id: DispatchId): Settlement {
  let outcome: DispatchOutcome | undefined;
  const listeners: Array<(outcome: DispatchOutcome) => void> = [];
  let resolve!: (outcome: DispatchOutcome) => void;
  const settled = new Promise<DispatchOutcome>((resolveSettled) => {
    resolve = resolveSettled;
  });
  return {
    issued: {
      id,
      settled,
      onSettled: (listener) => {
        if (outcome !== undefined) {
          listener(outcome);
        } else {
          listeners.push(listener);
        }
      },
    },
    settle: (next) => {
      if (outcome !== undefined) {
        return;
      }
      outcome = next;
      resolve(next);
      for (const listener of listeners) {
        listener(next);
      }
      listeners.length = 0;
    },
  };
}

// Settled dispatches are minted outside any coordinator, so their counter lives here. An id must
// be unique per instance: a caller that tells its own dispatches apart by identity — comparing the
// last issued one before and after a send to see whether anything went out — would read two
// consecutive dispatches sharing an id as the same one, and report the second as lost.
let settledMinted = 0;

/**
 * A dispatch that is over before it is handed out — for a caller that must return an
 * {@link IssuedDispatch} on a path where nothing will be sent. Its settlement has already been
 * delivered, so a listener registered on it runs on the spot.
 */
export function createSettledDispatch(outcome: DispatchOutcome, id?: DispatchId): IssuedDispatch {
  settledMinted += 1;
  const {issued, settle} = createSettlement(id ?? `settled-${settledMinted}-${outcome}`);
  settle(outcome);
  return issued;
}

/**
 * Holding the queue here rather than letting each dispatch go straight out is what makes dropping
 * one possible at all: a dispatch already sent cannot be taken back, so only one that is still
 * waiting can go. The queue also sees EVERY dispatch — facets, search, sort, pagination — which a
 * per-component scheduler could not, so the order of the user's gestures is preserved across
 * components.
 */
export function createDispatchCoordinator<TMessage>(
  send: (message: TMessage) => Promise<void> | void,
  options: DispatchCoordinatorOptions = {}
): DispatchCoordinator<TMessage> {
  const trace = options.trace ?? (() => {});
  const listeners = new Set<() => void>();
  let minted = 0;
  let inFlight: DispatchId | undefined;
  let sending = false;
  let queue: Array<QueuedDispatch<TMessage>> = [];
  let snapshot: DispatchSnapshot = {inFlight: undefined};

  // A fresh object only when the one observable fact actually changed, so an observer comparing
  // snapshot identity to decide whether to re-read sees no change where there was none.
  function publish(): void {
    if (snapshot.inFlight === inFlight) {
      return;
    }
    snapshot = {inFlight};
    for (const listener of [...listeners]) {
      listener();
    }
  }

  function drain(): void {
    if (sending) {
      return;
    }
    const entry = queue.shift();
    if (!entry) {
      return;
    }
    sending = true;
    inFlight = entry.id;
    publish();
    trace('send', entry.id);
    void (async () => {
      let outcome: DispatchOutcome = 'answered';
      try {
        await send(entry.message);
        trace('answered', entry.id);
      } catch (error) {
        // Swallowed deliberately. A send that threw is an OUTCOME, not an error for the caller to
        // handle: whoever is waiting on this dispatch has to be released, or the local state it
        // put on screen stays there for good. `settled` therefore never rejects.
        outcome = 'failed';
        trace('failed', entry.id, error);
      } finally {
        sending = false;
        inFlight = undefined;
        // Published BEFORE the settlement fires, so a listener that reads the snapshot from inside
        // its own settlement sees this dispatch already gone.
        publish();
        entry.settle(outcome);
        drain();
      }
    })();
  }

  function issue(message: TMessage, intent?: CoalesceIntent): IssuedDispatch {
    minted += 1;
    const id: DispatchId = `dispatch-${minted}`;
    const {issued, settle} = createSettlement(id);
    const satisfied = intent?.satisfiedByFlight === true;

    // Only an UNSENT dispatch can be taken back: the one already on its way has left the queue.
    if (intent !== undefined && !satisfied && intent.policy === 'involutive') {
      const undone = queue.findIndex(
        (queued) => queued.gesture === intent.gesture && queued.slot === intent.slot
      );
      if (undone !== -1) {
        const [cancelled] = queue.splice(undone, 1);
        trace('cancelled', cancelled.id, '+', id, `(${intent.gesture})`);
        cancelled.settle('cancelled');
        settle('cancelled');
        return issued;
      }
    }

    // An absolute write of the slot takes everything still queued for it — and so does a gesture
    // the sent request already produces, since those entries move AWAY from where it is landing.
    if (intent !== undefined && (satisfied || intent.policy === 'absolute')) {
      const superseded = queue.filter((queued) => queued.slot === intent.slot);
      if (superseded.length > 0) {
        queue = queue.filter((queued) => queued.slot !== intent.slot);
        trace(
          'superseded',
          superseded.map((queued) => queued.id).join(' + '),
          'by',
          id,
          `(${intent.slot})`
        );
        for (const queued of superseded) {
          queued.settle('superseded');
        }
      }
    }

    if (intent !== undefined && satisfied) {
      trace('satisfied', id, `by the dispatch in flight (${intent.slot})`);
      settle('satisfied');
      return issued;
    }

    queue.push({id, message, slot: intent?.slot, gesture: intent?.gesture, settle});
    trace('queued', id, `(depth ${queue.length})`);
    drain();
    return issued;
  }

  return {
    issue,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => snapshot,
  };
}
