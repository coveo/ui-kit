import {describe, expect, it, vi} from 'vitest';
import {
  createDispatchCoordinator,
  type CoalesceIntent,
} from '@/src/actions/dispatch-coordinator.js';
import {createDispatchTracker, type DispatchSource} from '@/src/actions/dispatch-tracker.js';

const PAGER = 'pager|page';
const absolute = (value: string): CoalesceIntent => ({
  slot: PAGER,
  gesture: `${PAGER}|${value}`,
  policy: 'absolute',
});

function spySource(): {issue: DispatchSource<string>['issue']; source: DispatchSource<string>} {
  const idle = {inFlight: undefined};
  const issue = vi.fn(createDispatchCoordinator<string>(() => undefined).issue);
  return {issue, source: {issue, getSnapshot: () => idle}};
}

/** Sends stay open until `answer()`, so a dispatch can be held in flight. */
function controllableSource() {
  const sent: string[] = [];
  const answers: Array<() => void> = [];
  const source = createDispatchCoordinator<string>((message) => {
    sent.push(message);
    return new Promise<void>((resolve) => answers.push(resolve));
  });
  return {source, sent, answer: () => answers.shift()?.()};
}

/** Mirrors the optimistic controller: declare, dispatch, withdraw. */
function gesture(
  tracker: ReturnType<typeof createDispatchTracker<string>>,
  message: string,
  declaration?: Parameters<typeof tracker.declareGesture>[0]
): Promise<void> {
  const withdraw = declaration ? tracker.declareGesture(declaration) : undefined;
  try {
    return tracker.dispatch(message);
  } finally {
    withdraw?.();
  }
}

describe('createDispatchTracker', () => {
  it('reports the dispatch on its way through a getter, never a republished value', () => {
    const {source} = controllableSource();
    const tracker = createDispatchTracker(source);
    expect(tracker.inFlight()).toBeUndefined();

    void gesture(tracker, 'page 2', {coalesce: absolute('2')});

    expect(tracker.inFlight()).toBe('dispatch-1');
  });

  it('reports the identity of the dispatch just issued', () => {
    const {source} = controllableSource();
    const tracker = createDispatchTracker(source);
    expect(tracker.lastIssued()).toBeUndefined();

    void gesture(tracker, 'A');
    expect(tracker.lastIssued()?.id).toBe('dispatch-1');

    void gesture(tracker, 'B');
    expect(tracker.lastIssued()?.id).toBe('dispatch-2');
  });

  it('hands the standing declaration to the dispatch it was declared for', () => {
    const {issue, source} = spySource();
    const tracker = createDispatchTracker(source);

    void gesture(tracker, 'page 2', {coalesce: absolute('2')});

    expect(issue).toHaveBeenCalledWith('page 2', absolute('2'));
  });

  it('withdraws the declaration so a later dispatch cannot inherit it', () => {
    const {issue, source} = spySource();
    const tracker = createDispatchTracker(source);

    void gesture(tracker, 'page 2', {coalesce: absolute('2')});
    void gesture(tracker, 'untracked');

    expect(issue).toHaveBeenLastCalledWith('untracked', undefined);
  });

  it('resolves once the dispatch it issued has settled', async () => {
    const {source, answer} = controllableSource();
    const tracker = createDispatchTracker(source);
    const settled = gesture(tracker, 'A');
    const done = vi.fn();
    void settled.then(done);

    await Promise.resolve();
    expect(done).not.toHaveBeenCalled();

    answer();
    await settled;
    expect(done).toHaveBeenCalled();
  });

  it('serializes through the one queue the source owns', async () => {
    const {source, sent, answer} = controllableSource();
    const tracker = createDispatchTracker(source);

    void gesture(tracker, 'A');
    void gesture(tracker, 'B');

    expect(sent).toEqual(['A']);
    answer();
    await Promise.resolve();
    expect(sent).toEqual(['A', 'B']);
  });

  describe('regions left behind', () => {
    it('marks nothing for a dispatch nobody declared anything for', async () => {
      const {source, answer} = controllableSource();
      const tracker = createDispatchTracker(source);
      expect(tracker.stale.isStale('results')).toBe(false);

      void gesture(tracker, 'facet search abc');
      expect(tracker.stale.isStale('results')).toBe(false);

      answer();
      await Promise.resolve();
      expect(tracker.stale.isStale('results')).toBe(false);
    });

    it('marks the declared region for a gesture that rebuilds it', async () => {
      const {source, answer} = controllableSource();
      const tracker = createDispatchTracker(source);
      expect(tracker.stale.isStale('results')).toBe(false);

      void gesture(tracker, 'select page 2', {invalidates: ['results']});
      expect(tracker.stale.isStale('results')).toBe(true);

      answer();
      await Promise.resolve();
      expect(tracker.stale.isStale('results')).toBe(false);
    });

    it('keeps the regions stale while any declaring dispatch still holds them', async () => {
      const {source, answer} = controllableSource();
      const tracker = createDispatchTracker(source);

      void gesture(tracker, 'A', {invalidates: ['results']});
      void gesture(tracker, 'B', {invalidates: ['results']});
      answer();
      await Promise.resolve();

      expect(tracker.stale.isStale('results')).toBe(true);

      answer();
      await Promise.resolve();
      expect(tracker.stale.isStale('results')).toBe(false);
    });

    it('marks nothing for a dispatch that was over before it was issued', () => {
      const {source} = controllableSource();
      const tracker = createDispatchTracker(source);

      // The blocker stays in flight so the A pair is still queued and cancels out.
      const involutive: CoalesceIntent = {
        slot: 'facet|values',
        gesture: 'facet|values|A',
        policy: 'involutive',
      };
      void gesture(tracker, 'blocker', {invalidates: ['results']});
      void gesture(tracker, 'A', {coalesce: involutive, invalidates: ['results']});
      void gesture(tracker, 'A again', {coalesce: involutive, invalidates: ['results']});

      expect(tracker.stale.isStale('results')).toBe(true);
      expect(tracker.inFlight()).toBe('dispatch-1');
    });
  });
});
