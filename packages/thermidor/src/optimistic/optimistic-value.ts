/**
 * One producer value, with the gestures made against it held on screen until the producer has
 * answered them.
 *
 * The whole invariant is one sentence: SHOW MY INTENTION WHILE I HAVE A GESTURE OUTSTANDING, THEN
 * SHOW THE PRODUCER. Nothing is composed and nothing is reconciled — while a gesture of this
 * value's is outstanding the producer's value is not read at all, which is what makes a late
 * answer harmless: there is no comparison for it to win.
 *
 * Holding ONE value is sound because each gesture derives its outcome from what is currently
 * DISPLAYED, so the value held already contains every gesture before it — they form a chain, not a
 * set. The cost is named on {@link OptimisticNext}: whatever the gesture did not claim is frozen
 * with it until the last answer arrives.
 *
 * The only module in here that reaches into `../actions`: deciding whether a gesture is already
 * produced by the request on its way takes the gesture's outcome and what that request is going to
 * land on, and the second of those is the queue's to know. Everything React-shaped stays out — a
 * view layer binds to `subscribe` / `getVersion` and passes the producer value in, which is the one
 * thing it owns and this controller cannot hold.
 *
 * It SHRINKS when the producer takes the queue over, and this is the checklist of what goes with
 * `../actions`: the `coalesce` field and the {@link CoalesceIntent} built from it, `landingValue`,
 * `satisfiedByFlight`, and the gesture identity only queue pairing needs (`gestureLabel`,
 * `stableJson`). What stays is holding a gesture until its answer — the held value, the counter,
 * the store, the stale scopes a gesture declares, and the report of a lost action.
 */
import type {
  CoalesceIntent,
  CoalescePolicy,
  DispatchId,
  IssuedDispatch,
} from '@/src/actions/dispatch-coordinator.js';
import type {StaleScope} from '@/src/optimistic/stale-scope.js';

/** Derives a gesture's outcome from the value currently on screen. */
export type OptimisticTransform<T> = (current: T) => T;

/**
 * What a gesture shows while it is outstanding: the next value outright, or how to derive it from
 * the one currently displayed.
 *
 * Applied ONCE, at the moment of the gesture, to what is on screen then — not re-applied against
 * later producer values. So a partial write freezes what it did not claim (facet counts, totals)
 * for as long as this value has a gesture outstanding, and those become current again with the
 * last answer. That is the price of holding one value; the region a gesture leaves behind is what
 * {@link OptimisticGesture.invalidates} is for.
 *
 * `T` is therefore never itself a function.
 */
export type OptimisticNext<T> = T | OptimisticTransform<T>;

/**
 * `TScope` is the region vocabulary of the app writing the gesture. Left out, any region name is
 * accepted — which is what a consumer that names none wants, and what one that names its own must
 * be able to narrow here rather than by patching this type from outside.
 */
export interface OptimisticGesture<T, TAction, TScope extends StaleScope = StaleScope> {
  /** What is asked of the producer. */
  action: TAction;
  /** What to show until the producer has answered this value's outstanding gestures. */
  next: OptimisticNext<T>;
  /** Omitted, nothing queued may be dropped on this gesture's behalf — always safe. */
  coalesce?: CoalescePolicy;
  /**
   * The regions this gesture leaves behind until it is answered. Omitted, the caller's default
   * applies; `[]` is how a gesture the producer answers without rebuilding anything says so.
   */
  invalidates?: readonly TScope[];
}

/**
 * What the dispatch that goes out NEXT carries. Two declarations with opposite lifetimes, which is
 * why they are separate fields rather than one object: the coalescing goes away with the
 * client-side queue, the invalidation does not.
 */
export interface GestureDeclaration {
  coalesce?: CoalesceIntent;
  invalidates?: readonly StaleScope[];
}

/**
 * What this controller needs from the dispatch layer, read through getters so a view layer that
 * rebuilds its handlers on every render cannot freeze the first one.
 *
 * It exists in this shape because of a bridge in between: a component dispatches through a
 * renderer call that returns nothing, so there is no way to hand a declaration to that dispatch
 * nor to receive its identity back from it. Hence a declaration for the NEXT one, and a reading of
 * the last one issued before and after.
 */
export interface DispatchQueue {
  /** The dispatch issued most recently, by whichever gesture issued it. */
  lastIssued: () => IssuedDispatch | undefined;
  /** The one dispatch already sent, which cannot be taken back. */
  inFlight: () => DispatchId | undefined;
  /** Declares what the next dispatch carries, and returns the withdrawal of that declaration. */
  declareGesture: (declaration: GestureDeclaration) => () => void;
}

export interface OptimisticValueController<T, TAction> {
  /** What to render: this value's held intention while a gesture is outstanding, else the producer's. */
  value: (backendValue: T) => T;
  /**
   * The state a gesture issued now will be applied to — the producer's value plus the one dispatch
   * already sent, which cannot be taken back. Compare it with what the gesture would show to
   * decide whether dropping the gestures queued in between changes the outcome.
   *
   * `undefined` means it cannot be told: this value has gestures outstanding whose oldest has
   * already been answered, so which of the rest is on its way is not known here. A caller that
   * reads `undefined` must NOT drop anything — not knowing is not permission.
   */
  landingValue: (backendValue: T) => T | undefined;
  /**
   * Dispatches `action` and holds `next` until every gesture of this value's has been answered.
   *
   * A gesture that issues no dispatch holds nothing: no answer would ever release it.
   *
   * The producer value is a parameter because the view owns it — it arrives on every render, and a
   * controller that held a copy would be deciding against a stale one.
   */
  dispatch: (backendValue: T, gesture: OptimisticGesture<T, TAction>) => void;
  /**
   * Pairs with {@link OptimisticValueController.getVersion} as an external store: notified whenever
   * that version moves. Returns the unsubscribe.
   */
  subscribe: (listener: () => void) => () => void;
  /**
   * Changes whenever what to render changes, stable between changes. The held value mutates in
   * place, so there is no new object identity to compare: this integer is the smallest thing that
   * tells a view layer it has to re-read, and being a primitive it trivially satisfies a framework
   * that demands a stable snapshot reference.
   */
  getVersion: () => number;
}

export interface OptimisticValueOptions<TAction> {
  /** Identifies this value among the others — the slot gestures are dropped within. */
  instanceId: string;
  /**
   * Reads the bridge an action is handed to. A getter rather than the function itself, because the
   * controller is built once and outlives the render that built it — a captured bridge would stay
   * the first one forever.
   */
  dispatch: () => (action: TAction) => void;
  /**
   * Reads the queue a gesture declares itself to, and which answers what is currently in flight. A
   * getter for the same reason as {@link OptimisticValueOptions.dispatch}.
   */
  queue: () => DispatchQueue;
  /**
   * Reports a gesture whose dispatch never happened: the action was handed to the bridge and no
   * dispatch came back from it.
   *
   * Deliberately NOT a development-only trace. The bridge swallows an action whose surface has
   * been disposed without printing anything, so without this the loss is invisible exactly where
   * it matters. Injected rather than written to a console here, because where a message goes is
   * the consumer's decision.
   */
  onActionLost?: (message: string) => void;
  /** One line per `held` / `released` transition; omitted, nothing is traced. */
  trace?: (...parts: unknown[]) => void;
}

/**
 * Structural, because a gesture rebuilds the value rather than mutating it, so what it would show
 * and the landing state are never the same object even when they describe the same state.
 *
 * Not part of the package's public surface: it is the guard's own comparison, and a consumer
 * comparing two values has its own notion of what counts.
 */
export function sameState(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) {
    return true;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, index) => sameState(item, b[index]));
  }
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return false;
  }
  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length &&
    keys.every((key) =>
      sameState((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
    )
  );
}

/**
 * Key-order independent, because the identity below is compared as a string: the same context
 * written `{start, end}` at one call site and `{end, start}` at another has to produce one
 * identity, or a gesture would stop pairing with its own inverse.
 */
function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(',')}]`;
  }
  if (typeof value === 'object' && value !== null) {
    const entries = Object.keys(value as Record<string, unknown>)
      .sort()
      .map((key) => `${key}:${stableJson((value as Record<string, unknown>)[key])}`);
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

/**
 * Names the gesture from the action itself — `toggleSelect{value:"Blue"}` — so nothing about a
 * gesture's identity is a string the call site had to invent and could misspell. Two gestures are
 * the same gesture exactly when they ask the producer for the same thing, which is the predicate
 * an involutive gesture pairs on.
 *
 * Structural: it reads the A2-UI user-action envelope, which is this package's own protocol, and
 * nothing of any component contract carried inside it.
 */
export function gestureLabel(action: unknown): string {
  if (typeof action !== 'object' || action === null || !('event' in action)) {
    return 'gesture';
  }
  const event = (action as {event: unknown}).event;
  if (typeof event !== 'object' || event === null || !('name' in event)) {
    return 'gesture';
  }
  const {name, context} = event as {name: unknown; context?: unknown};
  if (typeof name !== 'string') {
    return 'gesture';
  }
  const hasContext =
    typeof context === 'object' &&
    context !== null &&
    Object.keys(context as Record<string, unknown>).length > 0;
  return hasContext ? `${name}${stableJson(context)}` : name;
}

function apply<T>(next: OptimisticNext<T>, current: T): T {
  return typeof next === 'function' ? (next as OptimisticTransform<T>)(current) : next;
}

/** The oldest gesture of this value's that is still outstanding, and what it would land on. */
interface Oldest<T> {
  id: DispatchId;
  value: T;
}

export function createOptimisticValue<T, TAction>(
  options: OptimisticValueOptions<TAction>
): OptimisticValueController<T, TAction> {
  const {instanceId} = options;
  const trace = options.trace ?? (() => {});
  const listeners = new Set<() => void>();
  let version = 0;
  /** Undefined exactly when nothing is outstanding. */
  let held: T | undefined;
  let outstanding = 0;
  let oldest: Oldest<T> | undefined;

  function changed(): void {
    version += 1;
    for (const listener of [...listeners]) {
      listener();
    }
  }

  function value(backendValue: T): T {
    return held ?? backendValue;
  }

  function landingValue(backendValue: T): T | undefined {
    if (oldest !== undefined) {
      // The oldest of mine is either the one sent, or still queued behind someone else's — and if
      // it is queued then so is every newer one of mine, so nothing of mine has been sent.
      return options.queue().inFlight() === oldest.id ? oldest.value : backendValue;
    }
    // Nothing of this value's is outstanding, so a gesture issued now applies to the producer's
    // value. A request on its way that belongs to another value is not the same answer: the
    // producer's handlers rewrite only the node they target.
    return outstanding === 0 ? backendValue : undefined;
  }

  /**
   * True when the request ALREADY SENT is going to land exactly where this gesture wants, so
   * asking the producer for it again would change nothing.
   *
   * Every condition is inside this one function on purpose. "Something of mine is on its way" is
   * part of the guard, not its caller's business: with nothing sent there is no landing state to
   * match, and a gesture that merely looks like a no-op against the producer's value still has to
   * go out.
   */
  function satisfiedByFlight(candidate: T): boolean {
    return (
      oldest !== undefined &&
      options.queue().inFlight() === oldest.id &&
      sameState(candidate, oldest.value)
    );
  }

  function dispatch(backendValue: T, gesture: OptimisticGesture<T, TAction>): void {
    const {action, next, coalesce, invalidates} = gesture;
    const traceLabel = gestureLabel(action);
    const queue = options.queue();
    const before = queue.lastIssued()?.id;
    const candidate = apply(next, value(backendValue));

    const coalesceIntent: CoalesceIntent | undefined =
      coalesce === undefined
        ? undefined
        : {
            slot: instanceId,
            gesture: `${instanceId}|${traceLabel}`,
            policy: coalesce,
            satisfiedByFlight: satisfiedByFlight(candidate),
          };

    const withdraw =
      coalesceIntent === undefined && invalidates === undefined
        ? undefined
        : queue.declareGesture({coalesce: coalesceIntent, invalidates});

    try {
      options.dispatch()(action);
    } finally {
      withdraw?.();
    }

    const issued = queue.lastIssued();
    if (issued === undefined || issued.id === before) {
      options.onActionLost?.(
        `An action was lost: ${traceLabel} issued no dispatch (component ${instanceId}). ` +
          'Its surface is most likely gone — the action never left the page.'
      );
      return;
    }

    // Held BEFORE the settlement is registered. A gesture that ends on the spot — paired off
    // against its own inverse, or already produced by the request on its way — has an outcome
    // the producer IS going to reach, so it belongs on screen; what must not survive is its
    // HOLD, and the release below takes care of that in the same breath.
    held = candidate;
    if (outstanding === 0) {
      oldest = {id: issued.id, value: candidate};
    }
    outstanding += 1;

    let isReleased = false;
    issued.onSettled(() => {
      if (isReleased) {
        return;
      }
      isReleased = true;
      outstanding -= 1;
      if (oldest?.id === issued.id) {
        oldest = undefined;
      }
      if (outstanding === 0) {
        held = undefined;
      }
      trace(
        'released',
        traceLabel,
        issued.id,
        outstanding === 0 ? '— showing the producer' : `— ${outstanding} still outstanding`
      );
      changed();
    });

    if (!isReleased) {
      trace('held', traceLabel, issued.id, `— ${outstanding} outstanding`);
    }
    changed();
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  function getVersion(): number {
    return version;
  }

  return {value, landingValue, dispatch, subscribe, getVersion};
}
