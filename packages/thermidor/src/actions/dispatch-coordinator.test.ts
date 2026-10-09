import {describe, expect, it, vi} from 'vitest';
import {
  type CoalesceIntent,
  createDispatchCoordinator,
  createSettledDispatch,
  type DispatchOutcome,
} from '@/src/actions/dispatch-coordinator.js';

const FACET = 'facet-brand|values';
const PAGER = 'pager|page';

const involutive = (value: string, slot = FACET): CoalesceIntent => ({
  slot,
  gesture: `${slot}|${value}`,
  policy: 'involutive',
});

const absolute = (slot: string, value: string): CoalesceIntent => ({
  slot,
  gesture: `${slot}|${value}`,
  policy: 'absolute',
});

const delta = (slot: string, value: string): CoalesceIntent => ({
  slot,
  gesture: `${slot}|${value}`,
  policy: 'dependent',
});

/** `satisfiedByFlight` wins over the declared policy. */
const satisfied = (slot: string, value: string): CoalesceIntent => ({
  slot,
  gesture: `${slot}|${value}`,
  policy: 'dependent',
  satisfiedByFlight: true,
});

/** Each send stays open until `answer()`, so later gestures queue behind it. */
function coordinate() {
  const answers: Array<() => void> = [];
  const sent: string[] = [];
  const send = vi.fn((message: string) => {
    sent.push(message);
    return new Promise<void>((resolve) => answers.push(resolve));
  });
  const coordinator = createDispatchCoordinator(send);
  const outcomes: Array<[string, DispatchOutcome]> = [];

  return {
    sent,
    outcomes,
    inFlight: () => coordinator.getSnapshot().inFlight,
    snapshot: () => coordinator.getSnapshot(),
    subscribe: (listener: () => void) => coordinator.subscribe(listener),
    gesture: (message: string, intent?: CoalesceIntent) => {
      const issued = coordinator.issue(message, intent);
      issued.onSettled((outcome) => outcomes.push([message, outcome]));
      return issued;
    },
    withholdQueued: () => coordinator.withholdQueued(),
    cancelInFlight: () => coordinator.cancelInFlight(),
    answer: async () => {
      answers.shift()?.();
      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
    },
  };
}

describe('createDispatchCoordinator', () => {
  it('sends one dispatch at a time', async () => {
    const run = coordinate();

    run.gesture('A');
    run.gesture('B');

    expect(run.sent).toHaveLength(1);
    await run.answer();
    expect(run.sent).toHaveLength(2);
  });

  it('hands out the identity before anything is sent', () => {
    const run = coordinate();

    expect(run.gesture('A').id).toBe('dispatch-1');
    expect(run.gesture('B').id).toBe('dispatch-2');
  });

  it('publishes the dispatch that has been sent', async () => {
    const run = coordinate();

    run.gesture('A');
    run.gesture('B');

    expect(run.inFlight()).toBe('dispatch-1');
    await run.answer();
    expect(run.inFlight()).toBe('dispatch-2');
  });

  it('cancels a queued gesture against its inverse — check A, B, C then un-check C', async () => {
    const run = coordinate();

    run.gesture('A', involutive('A'));
    run.gesture('B', involutive('B'));
    run.gesture('C', involutive('C'));
    run.gesture('C', involutive('C'));

    // A is already sent; the C pair cancels out.
    await run.answer();
    await run.answer();

    expect(run.sent).toEqual(['A', 'B']);
  });

  it('does not cancel a gesture that was already sent', async () => {
    const run = coordinate();

    run.gesture('C', involutive('C'));
    run.gesture('C', involutive('C'));

    // The first C was already sent.
    expect(run.sent).toHaveLength(1);
    await run.answer();
    expect(run.sent).toEqual(['C', 'C']);
  });

  it('does not cancel gestures on different values or different slots', async () => {
    const run = coordinate();

    run.gesture('A', involutive('A'));
    run.gesture('B', involutive('B'));
    run.gesture('B-elsewhere', involutive('B', 'facet-colour|values'));

    await run.answer();
    await run.answer();
    await run.answer();

    expect(run.sent).toHaveLength(3);
  });

  it('replaces every gesture queued for the slot an absolute write claims', async () => {
    const run = coordinate();

    run.gesture('page 1', absolute(PAGER, '1'));
    run.gesture('page 2', absolute(PAGER, '2'));
    run.gesture('page 3', absolute(PAGER, '3'));

    await run.answer();
    await run.answer();

    // Page 1 was already sent.
    expect(run.sent).toEqual(['page 1', 'page 3']);
  });

  it('leaves other slots untouched when a slot is replaced', async () => {
    const run = coordinate();

    run.gesture('A', involutive('A'));
    run.gesture('sort', absolute('sorter|sort', 'price'));
    run.gesture('page 2', absolute(PAGER, '2'));
    run.gesture('page 3', absolute(PAGER, '3'));

    await run.answer();
    await run.answer();
    await run.answer();

    expect(run.sent).toEqual(['A', 'sort', 'page 3']);
  });

  it('never drops a gesture that declares it may not', async () => {
    const run = coordinate();

    run.gesture('A', involutive('A'));
    run.gesture('range', delta(FACET, 'range:0-50'));
    run.gesture('range', delta(FACET, 'range:0-50'));

    await run.answer();
    await run.answer();
    await run.answer();

    // Flipping a range twice doesn't restore the prior selection.
    expect(run.sent).toHaveLength(3);
  });

  it('never drops an undeclared dispatch', async () => {
    const run = coordinate();

    run.gesture('A', involutive('A'));
    run.gesture('show more');
    run.gesture('clear', absolute(FACET, 'clear'));

    await run.answer();
    await run.answer();
    await run.answer();

    expect(run.sent).toEqual(['A', 'show more', 'clear']);
  });

  it('sends nothing for a gesture the dispatch on its way already produces', async () => {
    const run = coordinate();

    run.gesture('A', absolute(FACET, 'A'));
    run.gesture('B', absolute(FACET, 'B'));
    // Back to what the in-flight A produces.
    run.gesture('A again', satisfied(FACET, 'A'));

    await run.answer();
    await run.answer();

    expect(run.sent).toEqual(['A']);
  });

  describe('settlement', () => {
    it('settles a sent dispatch as answered', async () => {
      const run = coordinate();

      run.gesture('A');
      await run.answer();

      expect(run.outcomes).toEqual([['A', 'answered']]);
    });

    it('settles both halves of a cancelled pair', () => {
      const run = coordinate();

      run.gesture('A', involutive('A'));
      run.gesture('C', involutive('C'));
      run.gesture('C again', involutive('C'));

      expect(run.outcomes).toEqual([
        ['C', 'cancelled'],
        ['C again', 'cancelled'],
      ]);
    });

    it('settles a replaced gesture as superseded', () => {
      const run = coordinate();

      run.gesture('page 1', absolute(PAGER, '1'));
      run.gesture('page 2', absolute(PAGER, '2'));
      run.gesture('page 3', absolute(PAGER, '3'));

      expect(run.outcomes).toEqual([['page 2', 'superseded']]);
    });

    it('settles a gesture the dispatch on its way already produces as satisfied', () => {
      const run = coordinate();

      run.gesture('A', absolute(FACET, 'A'));
      run.gesture('A again', satisfied(FACET, 'A'));

      expect(run.outcomes).toEqual([['A again', 'satisfied']]);
    });

    it('delivers the settlement on the spot once it has already happened', () => {
      const run = coordinate();

      run.gesture('A', involutive('A'));
      const cancelled = run.gesture('C', involutive('C'));
      run.gesture('C again', involutive('C'));

      const late = vi.fn();
      cancelled.onSettled(late);
      expect(late).toHaveBeenCalledWith('cancelled');
    });

    it('resolves the promise with the outcome and never rejects', async () => {
      const run = coordinate();
      const send = run.gesture('A');

      await run.answer();

      await expect(send.settled).resolves.toBe('answered');
    });

    it('settles a dispatch whose send throws', async () => {
      const failing = createDispatchCoordinator<string>(() => {
        throw new Error('transport is down');
      });
      const issued = failing.issue('A');

      await expect(issued.settled).resolves.toBe('failed');
      expect(failing.getSnapshot().inFlight).toBeUndefined();
    });
  });

  describe('withholdQueued', () => {
    it('settles every WAITING gesture withheld and empties the queue', async () => {
      const run = coordinate();

      run.gesture('A');
      run.gesture('B');
      run.gesture('C');

      expect(run.sent).toEqual(['A']);

      run.withholdQueued();

      expect(run.outcomes).toEqual([
        ['B', 'withheld'],
        ['C', 'withheld'],
      ]);
      await run.answer();
      expect(run.sent).toEqual(['A']);
      expect(run.outcomes).toContainEqual(['A', 'answered']);
    });

    it('leaves the dispatch in flight untouched', () => {
      const run = coordinate();

      run.gesture('A');
      run.gesture('B');

      expect(run.inFlight()).toBe('dispatch-1');
      run.withholdQueued();

      expect(run.inFlight()).toBe('dispatch-1');
      expect(run.outcomes).toEqual([['B', 'withheld']]);
    });

    it('is a no-op when nothing is queued', () => {
      const run = coordinate();

      run.gesture('A');
      const before = run.snapshot();
      run.withholdQueued();

      expect(run.outcomes).toEqual([]);
      expect(run.snapshot()).toBe(before);
    });

    it('traces the gestures it drops', () => {
      const trace = vi.fn();
      const coordinator = createDispatchCoordinator<string>(() => new Promise<void>(() => {}), {
        trace,
      });
      coordinator.issue('A', absolute(PAGER, '1'));
      coordinator.issue('B', delta(PAGER, '2'));
      coordinator.issue('C', delta('other', '3'));
      trace.mockClear();

      coordinator.withholdQueued();

      expect(trace).toHaveBeenCalledWith('withheld', 'dispatch-2 + dispatch-3');
    });
  });

  describe('cancelInFlight', () => {
    it('settles the in-flight dispatch cancelled, and that wins over the send resolving', async () => {
      const run = coordinate();

      run.gesture('A');
      expect(run.inFlight()).toBe('dispatch-1');

      run.cancelInFlight();

      expect(run.outcomes).toEqual([['A', 'cancelled']]);

      // `drain`'s later settle('answered') must be ignored.
      await run.answer();
      expect(run.outcomes).toEqual([['A', 'cancelled']]);
    });

    it('frees the queue to drain the next gesture once the cancelled send resolves', async () => {
      const run = coordinate();

      run.gesture('A');
      run.gesture('B');

      run.cancelInFlight();
      expect(run.outcomes).toEqual([['A', 'cancelled']]);
      expect(run.sent).toEqual(['A']);

      await run.answer();
      expect(run.sent).toEqual(['A', 'B']);
      expect(run.inFlight()).toBe('dispatch-2');
    });

    it('is a no-op when nothing is in flight', () => {
      const run = coordinate();

      const before = run.snapshot();
      run.cancelInFlight();

      expect(run.outcomes).toEqual([]);
      expect(run.snapshot()).toBe(before);
    });

    it('traces the cancelled in-flight dispatch', () => {
      const trace = vi.fn();
      const coordinator = createDispatchCoordinator<string>(() => new Promise<void>(() => {}), {
        trace,
      });
      coordinator.issue('A', absolute(PAGER, '1'));
      trace.mockClear();

      coordinator.cancelInFlight();

      expect(trace).toHaveBeenCalledWith('cancelled-in-flight', 'dispatch-1');
    });
  });

  describe('store contract', () => {
    it('keeps the snapshot identity stable while nothing changes', () => {
      const run = coordinate();
      const first = run.snapshot();

      expect(run.snapshot()).toBe(first);

      run.gesture('A');
      expect(run.snapshot()).not.toBe(first);
    });

    it('notifies subscribers and stops once unsubscribed', () => {
      const run = coordinate();
      const listener = vi.fn();
      const unsubscribe = run.subscribe(listener);

      run.gesture('A');
      expect(listener).toHaveBeenCalled();

      unsubscribe();
      const callsBefore = listener.mock.calls.length;
      run.gesture('B');
      expect(listener.mock.calls.length).toBe(callsBefore);
    });
  });

  describe('tracing', () => {
    it('records the queue transitions a consumer needs to read a run', async () => {
      const lines: string[] = [];
      const coordinator = createDispatchCoordinator<string>(
        () => new Promise<void>(() => undefined),
        {trace: (...parts) => lines.push(parts.join(' '))}
      );

      coordinator.issue('page 1', absolute(PAGER, '1'));
      coordinator.issue('page 2', absolute(PAGER, '2'));
      coordinator.issue('page 3', absolute(PAGER, '3'));
      await Promise.resolve();

      expect(lines).toEqual([
        'queued dispatch-1 (depth 1)',
        'send dispatch-1',
        'queued dispatch-2 (depth 1)',
        'superseded dispatch-2 by dispatch-3 (pager|page)',
        'queued dispatch-3 (depth 1)',
      ]);
    });
  });
});

describe('createSettledDispatch', () => {
  it('is over before it is handed out', async () => {
    const issued = createSettledDispatch('withheld');
    const listener = vi.fn();

    issued.onSettled(listener);

    expect(listener).toHaveBeenCalledWith('withheld');
    await expect(issued.settled).resolves.toBe('withheld');
  });

  it('mints a distinct id for every instance', () => {
    // Callers compare ids before/after a send to detect whether anything went out.
    const first = createSettledDispatch('withheld');
    const second = createSettledDispatch('withheld');

    expect(second.id).not.toBe(first.id);
  });
});
