import {act, render} from '@testing-library/react';
import {createDispatchCoordinator} from '@coveo/thermidor';
import {describe, expect, it} from 'vitest';
import {
  DispatchProgressProvider,
  type TrackedDispatch,
  useStale,
  useTrackedDispatch,
} from './pending-dispatch.js';

// Tracker semantics are tested in `dispatch-tracker.test.ts`; this covers only the React binding.
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
    view.dispatchResults('select page 2');

    expect(view.tracker().progress).toBe(first);
  });

  it('threads the tracker through the context so a reader sees its stale store', () => {
    const view = mount();
    expect(view.seen.at(-1)).toBe(false);

    view.dispatch('show more');
    expect(view.seen.at(-1)).toBe(false);

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
