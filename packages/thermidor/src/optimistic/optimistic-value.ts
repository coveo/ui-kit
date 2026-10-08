/**
 * While a gesture is outstanding the producer's value is not read at all, so a late answer has
 * nothing to win against. Holding ONE value is sound because each gesture derives from what is
 * displayed, so gestures form a chain.
 *
 * Shrinks when the producer owns the queue: `coalesce`, `landingValue`, `satisfiedByFlight`,
 * `gestureLabel` and `stableJson` go with `../actions`.
 */
import type {
  CoalesceIntent,
  CoalescePolicy,
  DispatchId,
  IssuedDispatch,
} from '@/src/actions/dispatch-coordinator.js';
import type {StaleScope} from '@/src/optimistic/stale-scope.js';

export type OptimisticTransform<T> = (current: T) => T;

/**
 * Applied once, at gesture time — not re-applied to later producer values, so whatever it did not
 * claim stays frozen until the last answer. `T` must therefore never be a function.
 */
export type OptimisticNext<T> = T | OptimisticTransform<T>;

export interface OptimisticGesture<T, TAction, TScope extends StaleScope = StaleScope> {
  action: TAction;
  next: OptimisticNext<T>;
  /** Omitted, nothing queued may be dropped on this gesture's behalf. */
  coalesce?: CoalescePolicy;
  /** Omitted, the caller's default applies; `[]` means the producer rebuilds nothing. */
  invalidates?: readonly TScope[];
}

/** Separate fields: `coalesce` goes away with the client-side queue, `invalidates` does not. */
export interface GestureDeclaration {
  coalesce?: CoalesceIntent;
  invalidates?: readonly StaleScope[];
}

/**
 * The renderer's dispatch returns nothing, so a gesture declares itself for the NEXT dispatch and
 * reads `lastIssued` before and after to learn its identity.
 */
export interface DispatchQueue {
  lastIssued: () => IssuedDispatch | undefined;
  inFlight: () => DispatchId | undefined;
  /** Returns the withdrawal of the declaration. */
  declareGesture: (declaration: GestureDeclaration) => () => void;
}

export interface OptimisticValueController<T, TAction> {
  value: (backendValue: T) => T;
  /**
   * The state a gesture issued now will land on (producer value plus the in-flight dispatch).
   * `undefined` means unknown, and the caller must then NOT drop anything.
   */
  landingValue: (backendValue: T) => T | undefined;
  /** A gesture that issues no dispatch holds nothing: no answer would ever release it. */
  dispatch: (backendValue: T, gesture: OptimisticGesture<T, TAction>) => void;
  subscribe: (listener: () => void) => () => void;
  /** The held value has no stable identity to compare, so views re-read when this moves. */
  getVersion: () => number;
}

export interface OptimisticValueOptions<TAction> {
  /** Also the coalescing slot gestures are dropped within. */
  instanceId: string;
  /** A getter: the controller outlives its render, so a captured bridge would go stale. */
  dispatch: () => (action: TAction) => void;
  queue: () => DispatchQueue;
  /** Not dev-only: the bridge silently swallows actions for a disposed surface. */
  onActionLost?: (message: string) => void;
  trace?: (...parts: unknown[]) => void;
}

/** Structural: gestures rebuild values, so identity never matches. Not public API. */
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

/** Key-order independent, or a gesture would stop pairing with its own inverse. */
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

/** E.g. `toggleSelect{value:"Blue"}`; equal labels iff the producer is asked the same thing. */
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
      // If my oldest is not in flight, it and every newer one of mine are still queued.
      return options.queue().inFlight() === oldest.id ? oldest.value : backendValue;
    }
    // Another value's in-flight request is irrelevant: the producer rewrites only its target node.
    return outstanding === 0 ? backendValue : undefined;
  }

  /** A gesture that only looks like a no-op against the producer's value must still go out. */
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

    // Held before registering onSettled: a gesture may settle synchronously, and its outcome
    // still belongs on screen — only its hold must not survive.
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
