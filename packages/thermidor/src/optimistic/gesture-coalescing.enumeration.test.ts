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
 * Exhaustive check that COALESCING NEVER CHANGES THE OUTCOME: for every sequence of gestures up to
 * length 6, the state the producer reaches from the dispatches actually sent equals the state it
 * would reach from all of them.
 *
 * This is the net under the gesture IDENTITY, which is what `involutive` pairs on and `absolute`
 * supersedes within. It drives the real controller against the real coordinator — no React, no
 * jsdom — because a hand-written handful of cases is exactly what missed a flaw here before: an
 * earlier identity keyed by a caller-supplied label passed three manual tests and produced 339
 * divergences under enumeration.
 *
 * Going through the controller rather than hand-building intents also puts the derived
 * `satisfiedByFlight` under the same net, which is the other way a gesture can be dropped.
 *
 * Alphabet: the regular facet's own, where every action is a flip or a total write of the value
 * list. An APPEND (`applyCustomRange`) is deliberately excluded — a queued append is the one thing
 * an `absolute` write may not drop, which is why a numeric facet declares `absolute` only under a
 * guard. That case is asserted separately below rather than enumerated, because here it would
 * manufacture a failure the guard exists to prevent.
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

/** The producer's algebra, as `SearchActionHandler` implements it for a regular facet. */
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

/**
 * Issues the whole sequence back to back, which is the only moment coalescing can pay: the first
 * dispatch is on its way and cannot be taken back, so the rest meet each other in the queue.
 *
 * The producer value stays `INITIAL` throughout, because nothing has been answered yet — which is
 * precisely the situation holding a gesture on screen exists to cover.
 */
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
    // 3 + 9 + 27 + 81 + 243 + 729: the whole space, not a sample of it.
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
    // The outcome is preserved AND requests are saved — a net that only checked the outcome would
    // pass just as well against coalescing that never fires. Pinned as a floor rather than an
    // exact figure so a change that WEAKENS the saving fails here.
    expect(dispatches / gestures).toBeLessThan(0.75);
  });

  it('saves nothing less than it did when the landing value was known per dispatch', async () => {
    // What the guard gives up by holding ONE value: it declines when the oldest outstanding
    // gesture has already been answered, since which of the rest is on its way is not knowable
    // from here. This net cannot see that cost — every sequence is issued back to back, so no
    // settlement lands in the middle and the oldest is always still outstanding.
    //
    // Which is also why the cost is small in practice: back to back is exactly when coalescing
    // pays. A burst slow enough for the first answer to arrive is a burst whose queue has already
    // drained. The declining case is covered directly in `optimistic-value.test.ts`.
    const [a, b] = ALPHABET;
    const sent = await sentBy([a, b, a, b, a, b]);

    expect(sent.length).toBeLessThan(6);
  });
});

describe('an absolute write may not drop a queued append', () => {
  it('is the absolute gesture that must decline, not the append that is protected', async () => {
    // `dependent` says what THIS gesture may drop — it buys the gesture no protection from being
    // dropped. An `absolute` write takes everything queued in the slot whatever those entries
    // declared, so the append survives only when the clear itself declines to be absolute. That is
    // exactly what a numeric facet does with `sameRanges(landingValue, values) ? … : 'dependent'`.
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
