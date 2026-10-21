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

const selectOnly =
  (target: string) =>
  (values: FacetValue[]): FacetValue[] =>
    values.map((candidate) => ({
      ...candidate,
      state: candidate.value === target ? 'selected' : 'idle',
    }));

/** `?` marks an unknowable landing; an empty list is a real state. */
const shown = (values: readonly FacetValue[] | undefined) =>
  values === undefined
    ? '?'
    : values.map((v) => `${v.value}:${v.state === 'selected' ? 'S' : '.'}`).join(' ');

/** An answer retires the oldest outstanding dispatch, mirroring the session's serialized order. */
function createCoordinator() {
  let minted = 0;
  let pending: ReadonlySet<DispatchId> = new Set();
  const settlers = new Map<DispatchId, Array<(outcome: DispatchOutcome) => void>>();
  let lastIssued: IssuedDispatch | undefined;
  const declared: CoalesceIntent[] = [];
  let standing: CoalesceIntent | undefined;
  const stale = createStaleScopes();
  let standingInvalidates: readonly string[] | undefined;

  const settle = (id: DispatchId) => {
    const next = new Set(pending);
    next.delete(id);
    pending = next;
    stale.settle(id);
    for (const listener of settlers.get(id) ?? []) {
      listener('answered');
    }
    settlers.delete(id);
  };

  return {
    declared,
    standing: () => standing,
    stale,
    progress: (): DispatchProgress => ({
      inFlight: () => [...pending][0],
      lastIssued: () => lastIssued,
      declareGesture: (declaration) => {
        if (declaration.coalesce !== undefined) {
          declared.push(declaration.coalesce);
        }
        standing = declaration.coalesce;
        standingInvalidates = declaration.invalidates;
        return () => {
          standing = undefined;
          standingInvalidates = undefined;
        };
      },
      stale,
    }),
    issue: () => {
      minted += 1;
      const id: DispatchId = `dispatch-${minted}`;
      settlers.set(id, []);
      pending = new Set(pending).add(id);
      stale.track(id, standingInvalidates ?? []);
      lastIssued = {
        id,
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
    retire: settle,
    desync: () => {
      pending = new Set();
    },
  };
}

/** Pass a `send` that issues nothing to exercise the lost-gesture path. */
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
    dispatcher,
    // Getter so destructuring `result` does not freeze the first render.
    result: {
      get current() {
        return current;
      },
    },
    flush,
    gesture: (target: string, next: OptimisticNext<FacetValue[]>, coalesce?: CoalescePolicy) => {
      act(() => current.dispatchOptimistic({action: toggleAction(target), next, coalesce}));
    },
    dispatch: () => {
      act(() => coordinator.issue());
      flush();
    },
    answer: (values: FacetValue[]) => {
      backend = values;
      act(() => coordinator.answer());
      flush();
    },
    answerOutOfOrder: (id: DispatchId, values: FacetValue[]) => {
      backend = values;
      act(() => coordinator.retire(id));
      flush();
    },
    push: (values: FacetValue[]) => {
      backend = values;
      flush();
    },
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

    // The producer's count is not read at all while a gesture is outstanding.
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
    // Answers the Black click, which never saw Blue.
    view.answer(snapshot(['Blue', 'idle', 84], ['Black', 'selected', 61]));

    expect(shown(view.result.current.value)).toBe('Blue:S Black:S');
  });

  it('hands a value back once its own gesture has been answered', () => {
    const view = mount(snapshot(['Blue', 'idle', 84]));

    view.gesture('Blue', select('Blue', 'selected'));
    view.answer(snapshot(['Blue', 'selected', 84]));
    view.push(snapshot(['Blue', 'idle', 84]));

    expect(shown(view.result.current.value)).toBe('Blue:.');
  });

  it('honours a refusal while an unrelated dispatch is still in flight', () => {
    const view = mount(snapshot(['Blue', 'idle', 84]));

    view.gesture('Blue', select('Blue', 'selected'));
    view.dispatch();
    expect(shown(view.result.current.value)).toBe('Blue:S');

    view.answer(snapshot(['Blue', 'idle', 84]));

    expect(shown(view.result.current.value)).toBe('Blue:.');
  });

  it('keeps holding while only unrelated dispatches are answered', () => {
    const view = mount(snapshot(['Blue', 'idle', 84]));

    // Issued first, so the next answer is this one's.
    view.dispatch();
    view.gesture('Blue', select('Blue', 'selected'));
    view.answer(snapshot(['Blue', 'idle', 84]));

    expect(shown(view.result.current.value)).toBe('Blue:S');
  });

  it('holds the net intent through six interleaved gestures', () => {
    // Each response reports the state as of the gesture it answers.
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

    // Answers the un-select; the re-select is still outstanding.
    view.answer(snapshot(['Blue', 'idle', 90]));
    expect(shown(view.result.current.value)).toBe('Blue:S');

    view.answer(snapshot(['Blue', 'selected', 84]));
    expect(shown(view.result.current.value)).toBe('Blue:S');
  });

  it('keeps holding until the last outstanding gesture is answered, in any order', () => {
    const view = mount(snapshot(['Blue', 'idle', 84], ['Black', 'idle', 61]));

    view.gesture('Blue', select('Blue', 'selected'));
    view.gesture('Black', select('Black', 'selected'));

    // One answer is not the producer catching up: Blue is still in flight.
    view.answerOutOfOrder('dispatch-2', snapshot(['Blue', 'idle', 84], ['Black', 'idle', 61]));

    expect(shown(view.result.current.value)).toBe('Blue:S Black:S');

    view.answer(snapshot(['Blue', 'selected', 84], ['Black', 'idle', 61]));

    expect(shown(view.result.current.value)).toBe('Blue:S Black:.');
  });

  it('holds nothing when the dispatch issues nothing, and reports the lost action', () => {
    const reported = vi.spyOn(console, 'error').mockImplementation(() => {});
    // Nothing would ever answer, so holding would strand the gesture on screen.
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

    // A goes out at once; B is queued and can still be dropped.
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
    // Slot is the hook instance; the gesture key adds action + context, which `involutive` pairs on.
    expect(declared?.gesture).toBe(`${declared?.slot}|toggle{target:"Blue"}`);
    // Left standing, it would leak onto the next, unrelated dispatch.
    expect(view.coordinator.standing()).toBeUndefined();
  });

  it('gives two gestures asking the producer for the same thing one identity', () => {
    const view = mount(snapshot(['Blue', 'idle', 84]));

    view.gesture('Blue', select('Blue', 'idle'), 'involutive');
    view.gesture('Blue', select('Blue', 'selected'), 'involutive');
    view.gesture('Black', select('Black', 'selected'), 'involutive');

    const [first, second, third] = view.coordinator.declared;
    expect(second?.gesture).toBe(first?.gesture);
    expect(third?.gesture).not.toBe(first?.gesture);
    expect(third?.slot).toBe(first?.slot);
  });

  it('declares nothing when the gesture declares no coalescing', () => {
    const view = mount(snapshot(['Blue', 'idle', 84]));

    view.gesture('Blue', select('Blue', 'selected'));

    expect(view.coordinator.declared).toEqual([]);
  });
});

describe('the region a gesture invalidates', () => {
  function fireGesture(invalidates?: readonly 'results'[]) {
    const coordinator = createCoordinator();
    let current!: OptimisticValue<FacetValue[], TestAction>;
    const backend = snapshot(['Blue', 'idle', 84]);

    function Consumer() {
      current = useOptimisticValue(backend, () => coordinator.issue());
      return null;
    }
    render(
      <DispatchProgressProvider value={coordinator.progress()}>
        <Consumer />
      </DispatchProgressProvider>
    );

    act(() =>
      current.dispatchOptimistic({
        action: toggleAction('Blue'),
        next: select('Blue', 'selected'),
        invalidates,
      })
    );
    return coordinator;
  }

  it('marks nothing for a gesture that declares no region', () => {
    const coordinator = fireGesture();

    expect(coordinator.stale.isStale('results')).toBe(false);
  });

  it('marks the region a gesture declares', () => {
    const coordinator = fireGesture(['results']);

    expect(coordinator.stale.isStale('results')).toBe(true);
  });

  it('withdraws the declaration so a later undeclared dispatch marks nothing', () => {
    const coordinator = fireGesture(['results']);

    act(() => coordinator.answer());
    expect(coordinator.stale.isStale('results')).toBe(false);

    act(() => coordinator.issue());
    expect(coordinator.stale.isStale('results')).toBe(false);
  });
});
