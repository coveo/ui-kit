import {render, act} from '@testing-library/react';
import {createStaleScopes} from '@coveo/thermidor';
import {describe, expect, it, vi} from 'vitest';
import {
  type CoalesceIntent,
  type DispatchId,
  type DispatchOutcome,
  type DispatchProgress,
  DispatchProgressProvider,
  type IssuedDispatch,
} from './pending-dispatch.js';
import {
  type CoalescePolicy,
  type OptimisticNext,
  type OptimisticValue,
  useOptimisticValue,
} from './use-optimistic-value.js';

type State = 'idle' | 'selected';
interface FacetValue {
  value: string;
  state: State;
  numberOfResults: number;
}

/** Stands in for a component's action union: the hook reads only `event.name`, for labelling. */
interface TestAction {
  event: {name: string; context: Record<string, unknown>};
}

const toggleAction = (target: string): TestAction => ({
  event: {name: 'toggle', context: {target}},
});

const snapshot = (...entries: Array<[string, State, number]>): FacetValue[] =>
  entries.map(([value, state, numberOfResults]) => ({value, state, numberOfResults}));

const select =
  (target: string, state: State) =>
  (values: FacetValue[]): FacetValue[] =>
    values.map((candidate) => (candidate.value === target ? {...candidate, state} : candidate));

/** Single-select: the gesture claims the whole list, not just its own value. */
const selectOnly =
  (target: string) =>
  (values: FacetValue[]): FacetValue[] =>
    values.map((candidate) => ({
      ...candidate,
      state: candidate.value === target ? 'selected' : 'idle',
    }));

/** `?` is how an unknowable landing value reads here — not an empty list, which is a real state. */
const shown = (values: readonly FacetValue[] | undefined) =>
  values === undefined
    ? '?'
    : values.map((v) => `${v.value}:${v.state === 'selected' ? 'S' : '.'}`).join(' ');

/**
 * Stands in for the coordinator the app mounts: issuing a dispatch mints an identity, an answer
 * retires the oldest outstanding one — the serialized order the session guarantees — and the oldest
 * outstanding identity is therefore the one in flight.
 */
function createCoordinator() {
  let minted = 0;
  let pending: ReadonlySet<DispatchId> = new Set();
  const settlers = new Map<DispatchId, Array<(outcome: DispatchOutcome) => void>>();
  let lastIssued: IssuedDispatch | undefined;
  const declared: CoalesceIntent[] = [];
  let standing: CoalesceIntent | undefined;

  const settle = (id: DispatchId) => {
    const next = new Set(pending);
    next.delete(id);
    pending = next;
    for (const listener of settlers.get(id) ?? []) {
      listener('answered');
    }
    settlers.delete(id);
  };

  return {
    /** Every intent declared, in order — one per gesture that declared any. */
    declared,
    /** An intent still standing after its gesture returned would leak to an unrelated dispatch. */
    standing: () => standing,
    progress: (): DispatchProgress => ({
      inFlight: () => [...pending][0],
      lastIssued: () => lastIssued,
      declareGesture: (declaration) => {
        if (declaration.coalesce !== undefined) {
          declared.push(declaration.coalesce);
        }
        standing = declaration.coalesce;
        return () => {
          standing = undefined;
        };
      },
      stale: createStaleScopes(),
    }),
    issue: () => {
      minted += 1;
      const id: DispatchId = `dispatch-${minted}`;
      settlers.set(id, []);
      pending = new Set(pending).add(id);
      lastIssued = {
        id,
        // Resolved by `settle` alongside the listeners: the resolver rides in the same list.
        settled: new Promise<DispatchOutcome>((resolve) => {
          settlers.get(id)?.push(resolve);
        }),
        onSettled: (listener) => {
          const waiting = settlers.get(id);
          if (waiting === undefined) {
            listener('answered');
          } else {
            waiting.push(listener);
          }
        },
      };
    },
    answer: () => {
      const [oldest] = pending;
      if (oldest !== undefined) {
        settle(oldest);
      }
    },
    /** Settles a specific dispatch, the way an out-of-order answer or a cancellation would. */
    retire: settle,
    /**
     * Publishes an outstanding set that has not caught up with the gestures just made — the window
     * in which the provider's state has not yet reached the component.
     */
    desync: () => {
      pending = new Set();
    },
  };
}

/**
 * Drives the hook the way a component does, against a coordinator a test can advance. `send` is
 * the component's own action seam; the default issues through the coordinator, and a test passes a
 * seam that issues nothing to exercise the lost-gesture path.
 */
function mount(initial: FacetValue[], send?: (action: TestAction) => void) {
  const coordinator = createCoordinator();
  let current!: OptimisticValue<FacetValue[], TestAction>;
  let backend = initial;

  const dispatcher = vi.fn<(action: TestAction) => void>(
    send ??
      (() => {
        coordinator.issue();
      })
  );

  function Consumer({values}: {values: FacetValue[]}) {
    current = useOptimisticValue(values, dispatcher);
    return null;
  }

  function Tree({values, progress}: {values: FacetValue[]; progress: DispatchProgress}) {
    return (
      <DispatchProgressProvider value={progress}>
        <Consumer values={values} />
      </DispatchProgressProvider>
    );
  }

  const view = render(<Tree values={backend} progress={coordinator.progress()} />);
  const flush = () => {
    act(() => view.rerender(<Tree values={backend} progress={coordinator.progress()} />));
  };

  return {
    coordinator,
    /** The component's action seam, so a test can assert what was dispatched. */
    dispatcher,
    // A getter on `current` itself: destructuring `result` must not freeze the first render.
    result: {
      get current() {
        return current;
      },
    },
    /** Publishes the coordinator's state to the component, as the provider's own render does. */
    flush,
    /** A user gesture: dispatches its action and holds what it would show. */
    gesture: (target: string, next: OptimisticNext<FacetValue[]>, coalesce?: CoalescePolicy) => {
      act(() => current.dispatchOptimistic({action: toggleAction(target), next, coalesce}));
    },
    /** A dispatch carrying nothing optimistic of its own — pagination, sort, show more. */
    dispatch: () => {
      act(() => coordinator.issue());
      flush();
    },
    /** The next answer arrives, reporting `values`. */
    answer: (values: FacetValue[]) => {
      backend = values;
      act(() => coordinator.answer());
      flush();
    },
    /** An answer for one specific dispatch, out of the order they were sent in. */
    answerOutOfOrder: (id: DispatchId, values: FacetValue[]) => {
      backend = values;
      act(() => coordinator.retire(id));
      flush();
    },
    /** A new snapshot with no answer attached. */
    push: (values: FacetValue[]) => {
      backend = values;
      flush();
    },
    /** A render in which the published outstanding set lags behind the gestures already made. */
    lagBehind: () => {
      act(() => coordinator.desync());
      flush();
    },
  };
}

describe('useOptimisticValue', () => {
  it('shows the gesture immediately', () => {
    const view = mount(snapshot(['Blue', 'idle', 84], ['Black', 'idle', 61]));

    view.gesture('Blue', select('Blue', 'selected'));

    expect(shown(view.result.current.value)).toBe('Blue:S Black:.');
  });

  it('keeps holding through a render whose outstanding set has not caught up', () => {
    const view = mount(snapshot(['Blue', 'idle', 84]));

    view.gesture('Blue', select('Blue', 'selected'));
    view.lagBehind();

    expect(shown(view.result.current.value)).toBe('Blue:S');
  });

  it('dispatches the action through the seam it was given', () => {
    const view = mount(snapshot(['Blue', 'idle', 84]));

    view.gesture('Blue', select('Blue', 'selected'));

    expect(view.dispatcher).toHaveBeenCalledTimes(1);
    expect(view.dispatcher).toHaveBeenCalledWith(toggleAction('Blue'));
  });

  it('takes the next value outright for a gesture that writes the whole of it', () => {
    const view = mount(snapshot(['Blue', 'idle', 84]));

    view.gesture('Blue', snapshot(['Blue', 'selected', 84]));

    expect(shown(view.result.current.value)).toBe('Blue:S');
  });

  it('freezes what the gesture did not claim until the last answer arrives', () => {
    const view = mount(snapshot(['Blue', 'idle', 84]));

    view.gesture('Blue', select('Blue', 'selected'));
    view.push(snapshot(['Blue', 'idle', 12]));

    // The price of holding ONE value: the producer's count is not read at all while a gesture is
    // outstanding. It is also what makes a late answer harmless — there is no comparison left for
    // it to win. The region going stale meanwhile is what `invalidates` dims.
    expect(view.result.current.value[0]).toEqual({
      value: 'Blue',
      state: 'selected',
      numberOfResults: 84,
    });

    view.answer(snapshot(['Blue', 'selected', 12]));

    expect(view.result.current.value[0]).toEqual({
      value: 'Blue',
      state: 'selected',
      numberOfResults: 12,
    });
  });

  it('ignores a snapshot answering an earlier gesture', () => {
    const view = mount(snapshot(['Blue', 'idle', 84], ['Black', 'idle', 61]));

    view.gesture('Black', select('Black', 'selected'));
    view.gesture('Blue', select('Blue', 'selected'));
    // Answers the Black click: it never saw the Blue one.
    view.answer(snapshot(['Blue', 'idle', 84], ['Black', 'selected', 61]));

    expect(shown(view.result.current.value)).toBe('Blue:S Black:S');
  });

  it('hands a value back once its own gesture has been answered', () => {
    const view = mount(snapshot(['Blue', 'idle', 84]));

    view.gesture('Blue', select('Blue', 'selected'));
    view.answer(snapshot(['Blue', 'selected', 84]));
    // Released: the backend may now un-select on its own.
    view.push(snapshot(['Blue', 'idle', 84]));

    expect(shown(view.result.current.value)).toBe('Blue:.');
  });

  it('honours a refusal while an unrelated dispatch is still in flight', () => {
    const view = mount(snapshot(['Blue', 'idle', 84]));

    view.gesture('Blue', select('Blue', 'selected'));
    // Pagination goes out behind the facet click and is nowhere near answered.
    view.dispatch();
    expect(shown(view.result.current.value)).toBe('Blue:S');

    // The answer to the facet click refuses the selection. Waiting for every dispatch to settle
    // would keep showing a selection the backend has already rejected.
    view.answer(snapshot(['Blue', 'idle', 84]));

    expect(shown(view.result.current.value)).toBe('Blue:.');
  });

  it('keeps holding while only unrelated dispatches are answered', () => {
    const view = mount(snapshot(['Blue', 'idle', 84]));

    // Pagination is issued first, so its answer comes first too.
    view.dispatch();
    view.gesture('Blue', select('Blue', 'selected'));
    view.answer(snapshot(['Blue', 'idle', 84]));

    expect(shown(view.result.current.value)).toBe('Blue:S');
  });

  it('holds the net intent through six interleaved gestures', () => {
    // Check A, B, C then un-check C, B, A while every answer is still outstanding. Each response
    // reports the state as of the gesture it answers, so any early release shows a value the user
    // has already moved past.
    const values = (a: State, b: State, c: State) =>
      snapshot(['A', a, 1], ['B', b, 1], ['C', c, 1]);
    const view = mount(values('idle', 'idle', 'idle'));

    const gestures: Array<[string, State]> = [
      ['A', 'selected'],
      ['B', 'selected'],
      ['C', 'selected'],
      ['C', 'idle'],
      ['B', 'idle'],
      ['A', 'idle'],
    ];
    gestures.forEach(([target, state]) => view.gesture(target, select(target, state)));
    expect(shown(view.result.current.value)).toBe('A:. B:. C:.');

    const responses: Array<[State, State, State]> = [
      ['selected', 'idle', 'idle'],
      ['selected', 'selected', 'idle'],
      ['selected', 'selected', 'selected'],
      ['selected', 'selected', 'idle'],
      ['selected', 'idle', 'idle'],
      ['idle', 'idle', 'idle'],
    ];
    responses.forEach((response) => {
      view.answer(values(...response));
      expect(shown(view.result.current.value)).toBe('A:. B:. C:.');
    });
  });

  it('survives a toggle back to the state the backend still reports', () => {
    const view = mount(snapshot(['Blue', 'selected', 84]));

    view.gesture('Blue', select('Blue', 'idle'));
    view.gesture('Blue', select('Blue', 'selected'));
    expect(shown(view.result.current.value)).toBe('Blue:S');

    // The un-select is answered while the re-select is still outstanding.
    view.answer(snapshot(['Blue', 'idle', 90]));
    expect(shown(view.result.current.value)).toBe('Blue:S');

    view.answer(snapshot(['Blue', 'selected', 84]));
    expect(shown(view.result.current.value)).toBe('Blue:S');
  });

  it('keeps holding until the last outstanding gesture is answered, in any order', () => {
    const view = mount(snapshot(['Blue', 'idle', 84], ['Black', 'idle', 61]));

    view.gesture('Blue', select('Blue', 'selected'));
    view.gesture('Black', select('Black', 'selected'));

    // The SECOND dispatch is answered first — and refused. One answer is not the producer having
    // caught up: the Blue gesture is still on its way, so what is held stays whole rather than
    // flickering to a state that is already out of date.
    view.answerOutOfOrder('dispatch-2', snapshot(['Blue', 'idle', 84], ['Black', 'idle', 61]));

    expect(shown(view.result.current.value)).toBe('Blue:S Black:S');

    // With the last one answered, the screen hands over to the producer — which refused Black.
    view.answer(snapshot(['Blue', 'selected', 84], ['Black', 'idle', 61]));

    expect(shown(view.result.current.value)).toBe('Blue:S Black:.');
  });

  it('holds nothing when the dispatch issues nothing, and reports the lost action', () => {
    const reported = vi.spyOn(console, 'error').mockImplementation(() => {});
    // A seam that reaches no coordinator: nothing would ever answer the gesture, so showing it
    // would strand it on screen.
    const view = mount(snapshot(['Blue', 'idle', 84]), () => {});

    view.gesture('Blue', select('Blue', 'selected'));

    expect(shown(view.result.current.value)).toBe('Blue:.');
    expect(reported).toHaveBeenCalledWith(expect.stringContaining('An action was lost: toggle'));
    reported.mockRestore();
  });

  it('applies the most recent gesture last when the same target is re-used', () => {
    const view = mount(snapshot(['A', 'idle', 1], ['B', 'idle', 1]));

    view.gesture('A', selectOnly('A'));
    view.gesture('B', selectOnly('B'));
    // Back to A while both answers are outstanding: a re-click must not leave its intent applied
    // in the position the first one took.
    view.gesture('A', selectOnly('A'));

    expect(shown(view.result.current.value)).toBe('A:S B:.');
  });

  it('accumulates gestures on different targets, each read off the screen', () => {
    const view = mount(snapshot(['Blue', 'idle', 84], ['Black', 'idle', 61]));

    view.gesture('Blue', select('Blue', 'selected'));
    view.gesture('Black', select('Black', 'selected'));

    expect(shown(view.result.current.value)).toBe('Blue:S Black:S');
  });

  it('lands on the backend value while nothing has been sent', () => {
    const view = mount(snapshot(['A', 'idle', 1], ['B', 'selected', 1]));

    expect(shown(view.result.current.landingValue())).toBe('A:. B:S');
  });

  it('lands past the dispatch in flight but not past the ones still queued', () => {
    const view = mount(snapshot(['A', 'idle', 1], ['B', 'idle', 1]));

    // A goes out at once; B is behind it and can still be dropped.
    view.gesture('A', selectOnly('A'));
    view.gesture('B', selectOnly('B'));
    view.flush();

    // What the producer reaches if both are sent…
    expect(shown(view.result.current.value)).toBe('A:. B:S');
    // …against what a gesture issued now would be applied to, B having gone.
    expect(shown(view.result.current.landingValue())).toBe('A:S B:.');
  });

  it('releases the landing value once the dispatch in flight is answered', () => {
    const view = mount(snapshot(['A', 'idle', 1]));

    view.gesture('A', selectOnly('A'));
    view.answer(snapshot(['A', 'selected', 1]));

    expect(shown(view.result.current.landingValue())).toBe('A:S');
  });

  it('declares the gesture coalescing and withdraws it before returning', () => {
    const view = mount(snapshot(['Blue', 'idle', 84]));

    view.gesture('Blue', select('Blue', 'selected'), 'involutive');

    const [declared] = view.coordinator.declared;
    expect(declared?.policy).toBe('involutive');
    // The slot is the hook instance, so one component's gestures never drop another's; the gesture
    // adds the action and its own context, which is what `involutive` pairs on — and neither is a
    // string the call site had to invent.
    expect(declared?.gesture).toBe(`${declared?.slot}|toggle{target:"Blue"}`);
    // Left standing, it would be picked up by the next, unrelated dispatch.
    expect(view.coordinator.standing()).toBeUndefined();
  });

  it('gives two gestures asking the producer for the same thing one identity', () => {
    const view = mount(snapshot(['Blue', 'idle', 84]));

    view.gesture('Blue', select('Blue', 'idle'), 'involutive');
    view.gesture('Blue', select('Blue', 'selected'), 'involutive');
    view.gesture('Black', select('Black', 'selected'), 'involutive');

    const [first, second, third] = view.coordinator.declared;
    // Same action, same context — the pair `involutive` may drop whole.
    expect(second?.gesture).toBe(first?.gesture);
    // A different target is a different gesture, and dropping the pair would lose a selection.
    expect(third?.gesture).not.toBe(first?.gesture);
    // Same slot throughout: they all write this instance's one value.
    expect(third?.slot).toBe(first?.slot);
  });

  it('declares nothing when the gesture declares no coalescing', () => {
    const view = mount(snapshot(['Blue', 'idle', 84]));

    view.gesture('Blue', select('Blue', 'selected'));

    expect(view.coordinator.declared).toEqual([]);
  });
});
