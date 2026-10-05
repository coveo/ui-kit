import {describe, expect, it, vi} from 'vitest';
import type {
  DispatchId,
  DispatchOutcome,
  IssuedDispatch,
} from '@/src/actions/dispatch-coordinator.js';
import {
  createOptimisticValue,
  type DispatchQueue,
  type GestureDeclaration,
  gestureLabel,
  sameState,
} from '@/src/optimistic/optimistic-value.js';

interface FacetValue {
  value: string;
  state: 'idle' | 'selected';
  numberOfResults: number;
}

type FacetAction = {event: {name: string; context?: unknown}};

const backend = (...selected: string[]): FacetValue[] =>
  ['blue', 'yellow', 'red'].map((value) => ({
    value,
    state: selected.includes(value) ? 'selected' : 'idle',
    numberOfResults: 10,
  }));

/** Single-select: the target becomes the only selection, so the LAST one applied wins. */
const only =
  (target: string) =>
  (current: FacetValue[]): FacetValue[] =>
    current.map((candidate) => ({
      ...candidate,
      state: candidate.value === target ? 'selected' : 'idle',
    }));

/** Multi-select: a flip, so a gesture derived from the displayed value accumulates. */
const flip =
  (target: string) =>
  (current: FacetValue[]): FacetValue[] =>
    current.map((candidate) =>
      candidate.value === target
        ? {...candidate, state: candidate.state === 'selected' ? 'idle' : 'selected'}
        : candidate
    );

const selectionOf = (values: FacetValue[]): string[] =>
  values.filter((value) => value.state === 'selected').map((value) => value.value);

/**
 * Stands in for the bridge the controller talks through: a dispatch that returns nothing, an
 * identity readable only from the outside, and a declaration for whatever goes out next.
 */
function createFakeQueue() {
  const declared: GestureDeclaration[] = [];
  const settleListeners = new Map<DispatchId, Array<(outcome: DispatchOutcome) => void>>();
  let pendingDeclaration: GestureDeclaration | undefined;
  let lastIssued: IssuedDispatch | undefined;
  let inFlight: DispatchId | undefined;
  let minted = 0;
  let issuesDispatches = true;
  let settlesOnTheSpot: DispatchOutcome | undefined;

  function settle(id: DispatchId, outcome: DispatchOutcome = 'answered'): void {
    for (const listener of settleListeners.get(id) ?? []) {
      listener(outcome);
    }
    settleListeners.delete(id);
  }

  const queue: DispatchQueue = {
    lastIssued: () => lastIssued,
    inFlight: () => inFlight,
    declareGesture: (declaration) => {
      declared.push(declaration);
      pendingDeclaration = declaration;
      return () => {
        pendingDeclaration = undefined;
      };
    },
  };

  return {
    queue,
    declared,
    settle,
    setInFlight: (id: DispatchId | undefined) => {
      inFlight = id;
    },
    /** A surface that swallows the action without issuing anything. */
    stopIssuing: () => {
      issuesDispatches = false;
    },
    /**
     * The queue decides the next dispatch is over before handing it back — dropped against
     * another gesture, or produced by the request already on its way.
     */
    settleNextOnTheSpot: (outcome: DispatchOutcome) => {
      settlesOnTheSpot = outcome;
    },
    dispatch: (_action: FacetAction) => {
      if (!issuesDispatches) {
        return;
      }
      minted += 1;
      const id = `dispatch-${minted}`;
      const alreadyOver = settlesOnTheSpot;
      settlesOnTheSpot = undefined;
      lastIssued = {
        id,
        settled: new Promise<DispatchOutcome>(() => {}),
        onSettled: (listener) => {
          if (alreadyOver !== undefined) {
            listener(alreadyOver);
            return;
          }
          const listeners = settleListeners.get(id) ?? [];
          listeners.push(listener);
          settleListeners.set(id, listeners);
        },
      };
      return pendingDeclaration;
    },
  };
}

function createController(fake: ReturnType<typeof createFakeQueue>, instanceId = 'facet-1') {
  return createOptimisticValue<FacetValue[], FacetAction>({
    instanceId,
    dispatch: () => fake.dispatch,
    queue: () => fake.queue,
  });
}

const toggleSingle = (value: string) => ({
  action: {event: {name: 'toggleSingleSelect', context: {value}}} as FacetAction,
  next: only(value),
});

describe('createOptimisticValue', () => {
  it('holds the gesture until the dispatch it rode on settles', () => {
    const fake = createFakeQueue();
    const controller = createController(fake);

    controller.dispatch(backend(), toggleSingle('blue'));
    expect(selectionOf(controller.value(backend()))).toEqual(['blue']);

    fake.settle('dispatch-1');
    expect(selectionOf(controller.value(backend()))).toEqual([]);
  });

  it('releases the gesture whatever the outcome was', () => {
    const fake = createFakeQueue();
    const controller = createController(fake);

    controller.dispatch(backend(), toggleSingle('blue'));
    fake.settle('dispatch-1', 'failed');

    expect(selectionOf(controller.value(backend()))).toEqual([]);
  });

  it('derives each gesture from what is displayed, so successive gestures accumulate', () => {
    const fake = createFakeQueue();
    const controller = createController(fake);
    const flipOf = (value: string) => ({
      action: {event: {name: 'toggleSelect', context: {value}}} as FacetAction,
      next: flip(value),
    });

    controller.dispatch(backend(), flipOf('blue'));
    controller.dispatch(backend(), flipOf('yellow'));
    controller.dispatch(backend(), flipOf('red'));

    // No composition anywhere: the third gesture read the second one's outcome off the screen.
    expect(selectionOf(controller.value(backend()))).toEqual(['blue', 'yellow', 'red']);
  });

  it('walks back to the producer value when a sequence undoes itself', () => {
    const fake = createFakeQueue();
    const controller = createController(fake);
    const flipOf = (value: string) => ({
      action: {event: {name: 'toggleSelect', context: {value}}} as FacetAction,
      next: flip(value),
    });

    // The sequence that invalidated every reconciliation rule tried before: three on, three off.
    for (const value of ['blue', 'yellow', 'red', 'red', 'yellow', 'blue']) {
      controller.dispatch(backend(), flipOf(value));
    }

    expect(selectionOf(controller.value(backend()))).toEqual([]);
  });

  it('keeps holding until the LAST outstanding gesture is answered', () => {
    const fake = createFakeQueue();
    const controller = createController(fake);

    controller.dispatch(backend(), toggleSingle('blue'));
    controller.dispatch(backend(), toggleSingle('yellow'));

    fake.settle('dispatch-1');
    // One answer is not the producer catching up: the second gesture is still on its way.
    expect(selectionOf(controller.value(backend()))).toEqual(['yellow']);

    fake.settle('dispatch-2');
    expect(selectionOf(controller.value(backend()))).toEqual([]);
  });

  it('keeps the outcome of a gesture the queue ended on the spot, but not its hold', () => {
    const fake = createFakeQueue();
    const controller = createController(fake);

    controller.dispatch(backend(), toggleSingle('blue'));
    fake.setInFlight('dispatch-1');
    // Dropped against the request on its way, which IS going to reach this state — so it belongs
    // on screen; what must not survive is a hold no answer would ever release.
    fake.settleNextOnTheSpot('satisfied');
    controller.dispatch(backend(), toggleSingle('yellow'));

    expect(selectionOf(controller.value(backend()))).toEqual(['yellow']);

    fake.settle('dispatch-1');
    expect(selectionOf(controller.value(backend()))).toEqual([]);
  });

  it('shows the producer at once when the only gesture ended on the spot', () => {
    const fake = createFakeQueue();
    const controller = createController(fake);

    fake.settleNextOnTheSpot('cancelled');
    controller.dispatch(backend(), toggleSingle('blue'));

    // Nothing was sent, so the producer's state never moved — and nothing will release a hold.
    expect(selectionOf(controller.value(backend()))).toEqual([]);
  });

  it('reports an action that issued no dispatch, and holds nothing for it', () => {
    const fake = createFakeQueue();
    const lost: string[] = [];
    const controller = createOptimisticValue<FacetValue[], FacetAction>({
      instanceId: 'facet-1',
      dispatch: () => fake.dispatch,
      queue: () => fake.queue,
      onActionLost: (message) => lost.push(message),
    });
    fake.stopIssuing();

    controller.dispatch(backend(), toggleSingle('blue'));

    expect(lost).toHaveLength(1);
    expect(lost[0]).toContain('toggleSingleSelect{value:"blue"}');
    expect(lost[0]).toContain('facet-1');
    expect(selectionOf(controller.value(backend()))).toEqual([]);
  });

  it('reads its ports on every gesture rather than freezing the first ones', () => {
    const first = createFakeQueue();
    const second = createFakeQueue();
    let current = first;
    const controller = createOptimisticValue<FacetValue[], FacetAction>({
      instanceId: 'facet-1',
      dispatch: () => current.dispatch,
      queue: () => current.queue,
    });

    current = second;
    controller.dispatch(backend(), {...toggleSingle('blue'), coalesce: 'absolute'});

    expect(second.declared).toHaveLength(1);
    expect(first.declared).toHaveLength(0);
  });

  describe('what holding one value costs', () => {
    it('does not read the producer value at all while a gesture is outstanding', () => {
      const fake = createFakeQueue();
      const controller = createController(fake);

      controller.dispatch(backend(), toggleSingle('blue'));
      const refreshedCounts = backend().map((value) => ({...value, numberOfResults: 3}));

      // The documented price of holding one value: what the gesture did not claim is frozen with
      // it. It is also what makes a late answer harmless — there is no comparison for it to win.
      expect(controller.value(refreshedCounts).map((value) => value.numberOfResults)).toEqual([
        10, 10, 10,
      ]);
    });

    it('shows the producer value, counts included, once the last gesture is answered', () => {
      const fake = createFakeQueue();
      const controller = createController(fake);

      controller.dispatch(backend(), toggleSingle('blue'));
      fake.settle('dispatch-1');
      const refreshedCounts = backend('blue').map((value) => ({...value, numberOfResults: 3}));

      expect(controller.value(refreshedCounts).map((value) => value.numberOfResults)).toEqual([
        3, 3, 3,
      ]);
    });
  });

  describe('landing value', () => {
    it('is the producer value when nothing of this value has been sent yet', () => {
      const fake = createFakeQueue();
      const controller = createController(fake);

      controller.dispatch(backend(), toggleSingle('blue'));

      // Queued behind someone else's request, so it can still be dropped.
      expect(selectionOf(controller.landingValue(backend()) ?? [])).toEqual([]);
    });

    it('is where the one dispatch already sent is going to land', () => {
      const fake = createFakeQueue();
      const controller = createController(fake);

      controller.dispatch(backend(), toggleSingle('blue'));
      fake.setInFlight('dispatch-1');
      controller.dispatch(backend(), toggleSingle('yellow'));

      // dispatch-1 has left; dispatch-2 is still queued and could still be dropped.
      expect(selectionOf(controller.landingValue(backend()) ?? [])).toEqual(['blue']);
    });

    it('is the producer value when what was sent belongs to another value', () => {
      const fake = createFakeQueue();
      const controller = createController(fake);

      controller.dispatch(backend(), toggleSingle('yellow'));
      fake.setInFlight('someone-elses-dispatch');

      expect(selectionOf(controller.landingValue(backend()) ?? [])).toEqual([]);
    });

    it('is the producer value when nothing is outstanding', () => {
      const fake = createFakeQueue();
      const controller = createController(fake);

      expect(selectionOf(controller.landingValue(backend('red')) ?? [])).toEqual(['red']);
    });

    it('cannot be told once the oldest outstanding gesture has been answered', () => {
      const fake = createFakeQueue();
      const controller = createController(fake);

      controller.dispatch(backend(), toggleSingle('blue'));
      fake.setInFlight('dispatch-1');
      controller.dispatch(backend(), toggleSingle('yellow'));
      fake.settle('dispatch-1');
      fake.setInFlight('dispatch-2');

      // dispatch-2 is now the one sent, and what it lands on is not known here. Not knowing is
      // not permission: a caller reading `undefined` must not drop anything.
      expect(controller.landingValue(backend())).toBeUndefined();
    });
  });

  describe('satisfied by the request already on its way', () => {
    const toggle = (value: string) => ({...toggleSingle(value), coalesce: 'absolute' as const});

    it('is declared when the gesture asks for exactly where the sent request lands', () => {
      const fake = createFakeQueue();
      const controller = createController(fake);

      controller.dispatch(backend(), toggle('blue'));
      fake.setInFlight('dispatch-1');
      controller.dispatch(backend(), toggle('yellow'));
      // Back to blue: dispatch-1 is already going there.
      controller.dispatch(backend(), toggle('blue'));

      expect(fake.declared.at(-1)?.coalesce?.satisfiedByFlight).toBe(true);
    });

    it('is not declared when the gesture asks for a different state', () => {
      const fake = createFakeQueue();
      const controller = createController(fake);

      controller.dispatch(backend(), toggle('blue'));
      fake.setInFlight('dispatch-1');
      controller.dispatch(backend(), toggle('red'));

      expect(fake.declared.at(-1)?.coalesce?.satisfiedByFlight).toBe(false);
    });

    it('is not declared when nothing has been sent, even for a gesture that changes nothing', () => {
      const fake = createFakeQueue();
      const controller = createController(fake);

      // A no-op against the producer value still has to go out: with nothing on its way there is
      // no landing state to match. The condition belongs to the guard, not to its caller.
      controller.dispatch(backend('blue'), toggle('blue'));

      expect(fake.declared.at(-1)?.coalesce?.satisfiedByFlight).toBe(false);
    });

    it('is not declared once the sent dispatch is no longer the one this value knows', () => {
      const fake = createFakeQueue();
      const controller = createController(fake);

      controller.dispatch(backend(), toggle('blue'));
      fake.setInFlight('dispatch-1');
      controller.dispatch(backend(), toggle('yellow'));
      fake.settle('dispatch-1');
      fake.setInFlight('dispatch-2');
      // Asking again for what dispatch-2 is sending — but which state that is cannot be told from
      // here, so the gesture goes out. Conservative by construction: a missed saving costs a
      // request, a wrong one would cost the gesture.
      controller.dispatch(backend(), toggle('yellow'));

      expect(fake.declared.at(-1)?.coalesce?.satisfiedByFlight).toBe(false);
    });
  });

  describe('declaration', () => {
    it('carries the slot and the gesture identity, and withdraws afterwards', () => {
      const fake = createFakeQueue();
      const controller = createController(fake, 'facet-7');

      controller.dispatch(backend(), {
        action: {event: {name: 'toggleSelect', context: {value: 'blue'}}},
        next: only('blue'),
        coalesce: 'involutive',
      });

      expect(fake.declared[0]?.coalesce).toMatchObject({
        slot: 'facet-7',
        gesture: 'facet-7|toggleSelect{value:"blue"}',
        policy: 'involutive',
      });
    });

    it('declares the regions a gesture leaves behind', () => {
      const fake = createFakeQueue();
      const controller = createController(fake);

      controller.dispatch(backend(), {
        action: {event: {name: 'search', context: {query: 'blu'}}},
        next: backend(),
        invalidates: [],
      });

      expect(fake.declared[0]?.invalidates).toEqual([]);
    });

    it('declares nothing for a gesture that neither coalesces nor invalidates', () => {
      const fake = createFakeQueue();
      const controller = createController(fake);

      controller.dispatch(backend(), toggleSingle('blue'));

      expect(fake.declared).toHaveLength(0);
    });
  });

  describe('store contract', () => {
    it('hands back the same reference while nothing has changed', () => {
      const fake = createFakeQueue();
      const controller = createController(fake);
      const producerValue = backend();

      controller.dispatch(producerValue, toggleSingle('blue'));

      // A snapshot handed to a view layer has to be stable between changes, or it re-reads for
      // ever. Holding one value satisfies this without a cache of any kind.
      expect(controller.value(producerValue)).toBe(controller.value(producerValue));
    });

    it('hands back the producer value itself when nothing is outstanding', () => {
      const fake = createFakeQueue();
      const controller = createController(fake);
      const producerValue = backend();

      expect(controller.value(producerValue)).toBe(producerValue);
    });

    it('notifies subscribers when a gesture is held and when it settles', () => {
      const fake = createFakeQueue();
      const controller = createController(fake);
      const listener = vi.fn();
      controller.subscribe(listener);

      controller.dispatch(backend(), toggleSingle('blue'));
      expect(listener).toHaveBeenCalledTimes(1);

      fake.settle('dispatch-1');
      expect(listener).toHaveBeenCalledTimes(2);
    });

    it('stops notifying an unsubscribed listener', () => {
      const fake = createFakeQueue();
      const controller = createController(fake);
      const listener = vi.fn();
      controller.subscribe(listener)();

      controller.dispatch(backend(), toggleSingle('blue'));

      expect(listener).not.toHaveBeenCalled();
    });

    it('moves the version on every change', () => {
      const fake = createFakeQueue();
      const controller = createController(fake);
      const before = controller.getVersion();

      controller.dispatch(backend(), toggleSingle('blue'));

      expect(controller.getVersion()).toBeGreaterThan(before);
    });
  });

  describe('tracing', () => {
    it('records the hold and the release, with what is still outstanding', () => {
      const fake = createFakeQueue();
      const lines: string[] = [];
      const controller = createOptimisticValue<FacetValue[], FacetAction>({
        instanceId: 'facet-1',
        dispatch: () => fake.dispatch,
        queue: () => fake.queue,
        trace: (...parts) => lines.push(parts.join(' ')),
      });

      controller.dispatch(backend(), toggleSingle('blue'));
      fake.settle('dispatch-1');

      expect(lines[0]).toContain('held');
      expect(lines[1]).toContain('showing the producer');
    });
  });
});

describe('gestureLabel', () => {
  it('names the gesture from the action, context included', () => {
    expect(gestureLabel({event: {name: 'toggleSelect', context: {value: 'Blue'}}})).toBe(
      'toggleSelect{value:"Blue"}'
    );
  });

  it('is key-order independent, so a gesture still pairs with its own inverse', () => {
    expect(gestureLabel({event: {name: 'applyCustomRange', context: {start: 1, end: 2}}})).toBe(
      gestureLabel({event: {name: 'applyCustomRange', context: {end: 2, start: 1}}})
    );
  });

  it('omits an empty context', () => {
    expect(gestureLabel({event: {name: 'clearAllActiveValues', context: {}}})).toBe(
      'clearAllActiveValues'
    );
  });

  it('falls back rather than throwing on something that is not an action', () => {
    expect(gestureLabel(undefined)).toBe('gesture');
    expect(gestureLabel({event: {}})).toBe('gesture');
  });
});

describe('sameState', () => {
  it('matches a rebuilt value against an equal one', () => {
    expect(sameState(backend('blue'), backend('blue'))).toBe(true);
  });

  it('separates values that differ anywhere', () => {
    expect(sameState(backend('blue'), backend('yellow'))).toBe(false);
    expect(sameState(backend('blue'), backend('blue').slice(1))).toBe(false);
    expect(sameState({a: 1}, {a: 1, b: 2})).toBe(false);
  });

  it('handles primitives and null without treating them as objects', () => {
    expect(sameState(1, 1)).toBe(true);
    expect(sameState(null, null)).toBe(true);
    expect(sameState(null, {})).toBe(false);
    expect(sameState('a', 'b')).toBe(false);
  });
});
