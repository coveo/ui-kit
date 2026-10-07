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
    /** A plain dispatch that declares nothing — the default, which marks no region. */
    dispatch: (message: string) => {
      let settled: Promise<void> | undefined;
      act(() => {
        settled = current.onAction(message);
      });
      return settled;
    },
    /**
     * A dispatch that declares `['results']`: declare the region onto the next dispatch, send,
     * withdraw.
     */
    dispatchResults: (message: string) => {
      let settled: Promise<void> | undefined;
      act(() => {
        const withdraw = current.progress.declareGesture({invalidates: ['results']});
        settled = current.onAction(message);
        withdraw();
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
    view.dispatchResults('select page 2');

    expect(view.tracker().progress).toBe(first);
  });

  it('threads the tracker through the context so a reader sees its stale store', () => {
    const view = mount();
    expect(view.seen.at(-1)).toBe(false);

    // The tracker's `onAction` is the one wired to A2UIProvider. Invalidation is explicit per
    // gesture: a dispatch declaring nothing marks nothing…
    view.dispatch('show more');
    expect(view.seen.at(-1)).toBe(false);

    // …while one declaring `['results']` marks the region and `useStale` re-renders the reader.
    view.dispatchResults('select page 2');
    expect(view.seen.at(-1)).toBe(true);
  });

  it('clears the dim once the dispatch holding the region is answered', async () => {
    const view = mount();
    view.dispatchResults('select page 2');
    expect(view.seen.at(-1)).toBe(true);

    await view.answer();
    expect(view.seen.at(-1)).toBe(false);
  });
});
