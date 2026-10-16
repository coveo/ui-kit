import {describe, expect, it} from 'vitest';
import {
  type CoalescePolicy,
  createDispatchCoordinator,
  type IssuedDispatch,
} from '@/src/actions/dispatch-coordinator.js';
import {
  createOptimisticValue,
  type DispatchQueue,
  type GestureDeclaration,
} from '@/src/optimistic/optimistic-value.js';

/**
 * Enumerated rather than hand-picked: an earlier gesture identity passed three manual cases and
 * diverged 339 times here. Appends are excluded from the alphabet; see the separate test below.
 */

type ValueState = 'idle' | 'selected';
type FacetState = ReadonlyArray<{value: string; state: ValueState}>;
interface FacetAction {
  event: {name: string; context: Record<string, unknown>};
}

const INSTANCE = ':r0:';
const INITIAL: FacetState = [
  {value: 'A', state: 'idle'},
  {value: 'B', state: 'selected'},
];

/** Mirrors `SearchActionHandler` for a regular facet. */
function apply(state: FacetState, action: FacetAction): FacetState {
  if (action.event.name === 'toggleSelect') {
    const target = action.event.context.value;
    return state.map((entry) =>
      entry.value === target
        ? {...entry, state: entry.state === 'selected' ? 'idle' : 'selected'}
        : entry
    );
  }
  return state.map((entry) => ({...entry, state: 'idle' as const}));
}

const shown = (state: FacetState) =>
  state.map((entry) => `${entry.value}:${entry.state === 'selected' ? 'S' : '.'}`).join(' ');

const toggle = (value: string): FacetAction => ({
  event: {name: 'toggleSelect', context: {value}},
});

const ALPHABET: ReadonlyArray<{action: FacetAction; coalesce: CoalescePolicy}> = [
  {action: toggle('A'), coalesce: 'involutive'},
  {action: toggle('B'), coalesce: 'involutive'},
  {action: {event: {name: 'clearAllActiveValues', context: {}}}, coalesce: 'absolute'},
];

/** Back to back, with the producer value pinned to `INITIAL` since nothing is answered yet. */
async function sentBy(
  sequence: ReadonlyArray<{action: FacetAction; coalesce: CoalescePolicy}>
): Promise<FacetAction[]> {
  const sent: FacetAction[] = [];
  const coordinator = createDispatchCoordinator<FacetAction>((message) => {
    sent.push(message);
  });
  let declared: GestureDeclaration | undefined;
  let lastIssued: IssuedDispatch | undefined;

  const queue: DispatchQueue = {
    lastIssued: () => lastIssued,
    inFlight: () => coordinator.getSnapshot().inFlight,
    declareGesture: (declaration) => {
      declared = declaration;
      return () => {
        declared = undefined;
      };
    },
  };
  const controller = createOptimisticValue<FacetState, FacetAction>({
    instanceId: INSTANCE,
    dispatch: () => (action) => {
      lastIssued = coordinator.issue(action, declared?.coalesce);
    },
    queue: () => queue,
  });

  for (const gesture of sequence) {
    controller.dispatch(INITIAL, {
      action: gesture.action,
      next: (current) => apply(current, gesture.action),
      coalesce: gesture.coalesce,
    });
  }
  // One macrotask flushes the microtask chain the drain runs on.
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
  return sent;
}

function sequencesUpTo(length: number): Array<Array<(typeof ALPHABET)[number]>> {
  let sequences: Array<Array<(typeof ALPHABET)[number]>> = [[]];
  const all: Array<Array<(typeof ALPHABET)[number]>> = [];
  for (let step = 0; step < length; step += 1) {
    sequences = sequences.flatMap((prefix) => ALPHABET.map((gesture) => [...prefix, gesture]));
    all.push(...sequences);
  }
  return all;
}

describe('coalescing never changes the outcome', () => {
  it('holds for every gesture sequence up to length 6', async () => {
    const sequences = sequencesUpTo(6);
    expect(sequences).toHaveLength(1092);

    const divergences: string[] = [];
    let gestures = 0;
    let dispatches = 0;
    for (const sequence of sequences) {
      const sent = await sentBy(sequence);
      gestures += sequence.length;
      dispatches += sent.length;
      const withCoalescing = sent.reduce(apply, INITIAL);
      const withoutCoalescing = sequence.map((gesture) => gesture.action).reduce(apply, INITIAL);
      if (shown(withCoalescing) !== shown(withoutCoalescing)) {
        divergences.push(
          `${sequence.map((gesture) => gesture.action.event.name).join(' → ')}: ` +
            `${shown(withCoalescing)} ≠ ${shown(withoutCoalescing)}`
        );
      }
    }

    expect(divergences).toEqual([]);
    // Otherwise coalescing that never fires would pass too.
    expect(dispatches / gestures).toBeLessThan(0.75);
  });

  it('saves nothing less than it did when the landing value was known per dispatch', async () => {
    // Back-to-back issuing never answers the oldest mid-burst, so the guard's cost is invisible
    // here; see `optimistic-value.test.ts`.
    const [a, b] = ALPHABET;
    const sent = await sentBy([a, b, a, b, a, b]);

    expect(sent.length).toBeLessThan(6);
  });
});

describe('an absolute write may not drop a queued append', () => {
  it('is the absolute gesture that must decline, not the append that is protected', async () => {
    // `dependent` only limits what a gesture may drop; it does not protect it from being dropped.
    const append: FacetAction = {
      event: {name: 'applyCustomRange', context: {start: 10, end: 20}},
    };
    const clear: FacetAction = {event: {name: 'clearAllActiveValues', context: {}}};
    // In flight, so the two behind it meet each other in the queue.
    const blocker: FacetAction = {event: {name: 'toggleSelect', context: {value: 'A'}}};

    const clearDeclaredAbsolute = await sentBy([
      {action: blocker, coalesce: 'involutive'},
      {action: append, coalesce: 'dependent'},
      {action: clear, coalesce: 'absolute'},
    ]);
    const clearDeclaredDependent = await sentBy([
      {action: blocker, coalesce: 'involutive'},
      {action: append, coalesce: 'dependent'},
      {action: clear, coalesce: 'dependent'},
    ]);

    expect(clearDeclaredAbsolute.map((action) => action.event.name)).not.toContain(
      'applyCustomRange'
    );
    expect(clearDeclaredDependent.map((action) => action.event.name)).toContain('applyCustomRange');
  });
});
