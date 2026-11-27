import {describe, expect, it, vi} from 'vitest';
import {createSessionStore, type SessionStoreState} from './store.js';

interface FakeTurn {
  id: string;
}

function createInitialState(
  overrides: Partial<SessionStoreState<FakeTurn>> = {}
): SessionStoreState<FakeTurn> {
  return {turns: [], ...overrides};
}

describe('createSessionStore', () => {
  it('notifies a subscribed listener exactly once per change', () => {
    const store = createSessionStore(createInitialState());
    const listener = vi.fn();
    store.subscribe(listener);

    store.setState(createInitialState({turns: [{id: 'a'}]}));

    expect(listener).toHaveBeenCalledTimes(1);

    store.setState(createInitialState({turns: [{id: 'a'}, {id: 'b'}]}));

    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('does not notify when setState receives a referentially-equal state', () => {
    const store = createSessionStore(createInitialState());
    const listener = vi.fn();
    store.subscribe(listener);

    store.setState((current) => current);

    expect(listener).not.toHaveBeenCalled();
  });

  it('stops all further notifications to a listener after it unsubscribes', () => {
    const store = createSessionStore(createInitialState());
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.setState(createInitialState({turns: [{id: 'a'}]}));
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();

    store.setState(createInitialState({turns: [{id: 'a'}, {id: 'b'}]}));
    store.setState(createInitialState({turns: [{id: 'c'}]}));

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('notifies every currently-registered subscriber once per change', () => {
    const store = createSessionStore(createInitialState());
    const first = vi.fn();
    const second = vi.fn();
    store.subscribe(first);
    store.subscribe(second);

    store.setState(createInitialState({turns: [{id: 'a'}]}));

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('leaves other subscribers unaffected when one unsubscribes', () => {
    const store = createSessionStore(createInitialState());
    const staying = vi.fn();
    const leaving = vi.fn();
    store.subscribe(staying);
    const unsubscribeLeaving = store.subscribe(leaving);

    unsubscribeLeaving();
    store.setState(createInitialState({turns: [{id: 'a'}]}));

    expect(leaving).not.toHaveBeenCalled();
    expect(staying).toHaveBeenCalledTimes(1);
  });
});
