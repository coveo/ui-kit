import {describe, it, expect, vi} from 'vitest';
import {act, render} from '@testing-library/react';
import {RequestStateProvider} from './request-state.js';
import {useOptimisticValue} from './use-optimistic-value.js';

type Facet = {value: string; state: 'idle' | 'selected'};
type TestAction = {event: {name: 'toggleSelect'; context: {value: string}}};

const BLUE: Facet = {value: 'Blue', state: 'idle'};
const RED: Facet = {value: 'Red', state: 'idle'};

function mount(backend: Facet[]) {
  const dispatch = vi.fn<(action: TestAction) => void>();
  let current!: ReturnType<typeof useOptimisticValue<Facet[], TestAction>>;
  function Consumer({values}: {values: Facet[]}) {
    current = useOptimisticValue(values, dispatch);
    return null;
  }
  const tree = (values: Facet[], settledRequests: number) => (
    <RequestStateProvider value={{actionInFlight: false, locked: false, settledRequests}}>
      <Consumer values={values} />
    </RequestStateProvider>
  );
  let settled = 0;
  let values = backend;
  const view = render(tree(values, settled));
  return {
    dispatch,
    get current() {
      return current;
    },
    toggle: (target: string) =>
      act(() =>
        current.dispatchOptimistic({
          action: {event: {name: 'toggleSelect', context: {value: target}}},
          next: (facets) =>
            facets.map((facet) =>
              facet.value === target
                ? {...facet, state: facet.state === 'selected' ? 'idle' : 'selected'}
                : facet
            ),
        })
      ),
    answer: (next: Facet[] = values) =>
      act(() => {
        settled += 1;
        values = next;
        view.rerender(tree(values, settled));
      }),
    push: (next: Facet[]) =>
      act(() => {
        values = next;
        view.rerender(tree(values, settled));
      }),
  };
}

describe('useOptimisticValue', () => {
  it('shows the gesture immediately and dispatches its action', () => {
    const facet = mount([BLUE, RED]);

    facet.toggle('Blue');

    expect(facet.current.value).toEqual([{...BLUE, state: 'selected'}, RED]);
    expect(facet.current.pending).toBe(true);
    expect(facet.dispatch).toHaveBeenCalledWith({
      event: {name: 'toggleSelect', context: {value: 'Blue'}},
    });
  });

  it('ignores producer values that arrive while its request is in flight', () => {
    const facet = mount([BLUE, RED]);

    facet.toggle('Blue');
    facet.push([BLUE, {...RED, state: 'selected'}]);

    expect(facet.current.value).toEqual([{...BLUE, state: 'selected'}, RED]);
  });

  it('shows the producer once the request ends, even when it refused the gesture', () => {
    const facet = mount([BLUE, RED]);

    facet.toggle('Blue');
    facet.answer([BLUE, RED]);

    expect(facet.current.value).toEqual([BLUE, RED]);
    expect(facet.current.pending).toBe(false);
  });

  it('builds a second gesture on the first while both are held', () => {
    const facet = mount([BLUE, RED]);

    facet.toggle('Blue');
    facet.toggle('Red');

    expect(facet.current.value).toEqual([
      {...BLUE, state: 'selected'},
      {...RED, state: 'selected'},
    ]);
  });
});
