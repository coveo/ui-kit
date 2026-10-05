import {act, render} from '@testing-library/react';
import {createDispatchCoordinator} from '@coveo/thermidor';
import {describe, expect, it} from 'vitest';
import {
  DispatchProgressProvider,
  type TrackedDispatch,
  useStale,
  useTrackedDispatch,
} from './pending-dispatch.js';

/**
 * The queue, the identities, the dropping rules and the region bookkeeping are the package's and
 * are tested there against plain objects (`dispatch-tracker.test.ts`, no jsdom). What is left to
 * check HERE is the React binding: that one tracker is built and threaded through the context, and
 * that `useStale` re-renders a region reader when the tracker crosses a staleness boundary.
 */
function mount() {
  const answers: Array<() => void> = [];
  const actions = createDispatchCoordinator<string>(
    () => new Promise<void>((resolve) => answers.push(resolve))
  );

  let current!: TrackedDispatch<string>;
  const seen: boolean[] = [];

  function Consumer() {
    current = useTrackedDispatch(actions);
    return (
      <DispatchProgressProvider value={current.progress}>
        <Observer />
      </DispatchProgressProvider>
    );
  }

  function Observer() {
    seen.push(useStale('results'));
    return null;
  }

  render(<Consumer />);

  return {
    seen,
    tracker: () => current,
    dispatch: (message: string) => {
      let settled: Promise<void> | undefined;
      act(() => {
        settled = current.onAction(message);
      });
      return settled;
    },
    answer: async () => {
      await act(async () => {
        answers.shift()?.();
        await Promise.resolve();
      });
    },
  };
}

describe('useTrackedDispatch', () => {
  it('builds one tracker and keeps the same instance across renders', () => {
    const view = mount();
    const first = view.tracker().progress;

    // A re-render through the staleness store must not rebuild the tracker.
    view.dispatch('show more');

    expect(view.tracker().progress).toBe(first);
  });

  it('threads the tracker through the context so a reader sees its stale store', () => {
    const view = mount();
    expect(view.seen.at(-1)).toBe(false);

    // The tracker's `onAction` is the one wired to A2UIProvider; dispatching through it marks the
    // default region, and `useStale` re-renders the reader.
    view.dispatch('show more');
    expect(view.seen.at(-1)).toBe(true);
  });

  it('clears the dim once the dispatch holding the region is answered', async () => {
    const view = mount();
    view.dispatch('show more');
    expect(view.seen.at(-1)).toBe(true);

    await view.answer();
    expect(view.seen.at(-1)).toBe(false);
  });
});
