/**
 * Scoped for removal: once the producer owns the queue, delete this directory, drop
 * `Session.actions`, and have the action path chain its sends again.
 */

/** Opaque so nothing comes to depend on dispatches being answered in order. */
export type DispatchId = string;

/**
 * What the producer's handler does with this action. Declared per gesture rather than in a central
 * table, since it can depend on state only the issuing component holds.
 */
export type CoalescePolicy =
  /** Writes the whole value whatever was queued ahead of it — `selectPage`, `selectSort`. */
  | 'absolute'
  /** Its own inverse: the same gesture queued twice may go as a pair — `toggleSelect`. */
  | 'involutive'
  /**
   * Drops nothing, but is still dropped by an `absolute` write behind it in the same slot; an entry
   * that must survive relies on the later gesture declining to be absolute.
   */
  | 'dependent';

export interface CoalesceIntent {
  slot: string;
  gesture: string;
  policy: CoalescePolicy;
  /**
   * The in-flight dispatch already produces this gesture's state. Derived (see
   * `../optimistic/optimistic-value.ts`), never hand-declared; wins over `policy`.
   */
  satisfiedByFlight?: boolean;
}

/** Terminal and delivered exactly once, including when no request was ever sent. */
export type DispatchOutcome =
  | 'answered'
  | 'failed'
  /** Never sent: no session to send on, or the payload was refused. */
  | 'withheld'
  /** Dropped against the gesture that undoes it, or preempted in flight. */
  | 'cancelled'
  /** Dropped by an absolute write of the same slot. */
  | 'superseded'
  /** Not sent: the in-flight dispatch already produces this state. */
  | 'satisfied';

export interface IssuedDispatch {
  id: DispatchId;
  /** Never rejects — a failed send is an outcome, not an error. */
  settled: Promise<DispatchOutcome>;
  /** Synchronous (immediate if already settled), so a listener's update batches with its cause. */
  onSettled: (listener: (outcome: DispatchOutcome) => void) => void;
}

export interface DispatchSnapshot {
  /**
   * No set of outstanding ids on purpose: absence can't tell "not yet published" from "ended".
   * Use {@link IssuedDispatch.onSettled}.
   */
  inFlight: DispatchId | undefined;
}

export interface DispatchCoordinator<TMessage> {
  /** Returns before any send, so the caller can tie local state to the id synchronously. */
  issue: (message: TMessage, intent?: CoalesceIntent) => IssuedDispatch;
  /**
   * Settles every waiting dispatch 'withheld' (in-flight untouched), for a caller about to open a
   * stream outside this queue that the queued gestures must not drain into.
   */
  withholdQueued: () => void;
  /**
   * Settles the in-flight dispatch 'cancelled' now so its local state is released; the caller
   * aborts the stream separately.
   */
  cancelInFlight: () => void;
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => DispatchSnapshot;
}

export interface DispatchCoordinatorOptions {
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

// Ids must stay unique: callers compare the last issued id before/after a send to detect a send.
let settledMinted = 0;

/** For a caller that must return an {@link IssuedDispatch} on a path where nothing is sent. */
export function createSettledDispatch(outcome: DispatchOutcome, id?: DispatchId): IssuedDispatch {
  settledMinted += 1;
  const {issued, settle} = createSettlement(id ?? `settled-${settledMinted}-${outcome}`);
  settle(outcome);
  return issued;
}

/** One queue for every dispatch, so gesture order is preserved across components. */
export function createDispatchCoordinator<TMessage>(
  send: (message: TMessage) => Promise<void> | void,
  options: DispatchCoordinatorOptions = {}
): DispatchCoordinator<TMessage> {
  const trace = options.trace ?? (() => {});
  const listeners = new Set<() => void>();
  let minted = 0;
  let inFlight: DispatchId | undefined;
  let inFlightEntry: QueuedDispatch<TMessage> | undefined;
  let sending = false;
  let queue: Array<QueuedDispatch<TMessage>> = [];
  let snapshot: DispatchSnapshot = {inFlight: undefined};

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
    inFlightEntry = entry;
    publish();
    trace('send', entry.id);
    void (async () => {
      let outcome: DispatchOutcome = 'answered';
      try {
        await send(entry.message);
        trace('answered', entry.id);
      } catch (error) {
        // Swallowed: waiters must be released, or their local state stays on screen for good.
        outcome = 'failed';
        trace('failed', entry.id, error);
      } finally {
        sending = false;
        inFlight = undefined;
        inFlightEntry = undefined;
        // Before settling, so a settlement listener reading the snapshot sees this dispatch gone.
        publish();
        // No-op if `cancelInFlight` already settled it 'cancelled'.
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

    // A satisfied gesture also drops the slot's queue: those entries move away from where it lands.
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

  function withholdQueued(): void {
    if (queue.length === 0) {
      return;
    }
    const dropped = queue;
    queue = [];
    trace('withheld', dropped.map((entry) => entry.id).join(' + '));
    for (const entry of dropped) {
      entry.settle('withheld');
    }
  }

  function cancelInFlight(): void {
    if (inFlightEntry === undefined) {
      return;
    }
    trace('cancelled-in-flight', inFlightEntry.id);
    inFlightEntry.settle('cancelled');
  }

  return {
    issue,
    withholdQueued,
    cancelInFlight,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => snapshot,
  };
}
