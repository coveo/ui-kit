import type {Mock} from 'vitest';
import {buildMockSearchEngine, type MockedSearchEngine} from '../../test/mock-engine-v2.js';
import {createMockState} from '../../test/mock-state.js';
import {buildController, type Controller} from './headless-controller.js';

describe('Controller', () => {
  let engine: MockedSearchEngine;
  let cmp: Controller;

  function registeredListeners() {
    return (engine.subscribe as Mock).mock.calls.map((args) => args[0]);
  }

  function updateControllerState(state: object) {
    vi.spyOn(cmp, 'state', 'get').mockReturnValue(state);
  }

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
    cmp = buildController(engine);
    updateControllerState({property: 'initial value'});
  });

  it('calling #subscribe invokes the passed listener immediately', () => {
    const listener = vi.fn();
    cmp.subscribe(listener);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('calling #subscribe registers a handler on the engine', () => {
    const listener = vi.fn();
    cmp.subscribe(listener);

    expect(registeredListeners().length).toBe(1);
  });

  it('the #subscribe method returns a function', () => {
    const listener = vi.fn();
    const returnValue = cmp.subscribe(listener);

    expect(typeof returnValue).toBe('function');
  });

  it('invoking the registered #subscribe handler calls the listener if the state has changed', () => {
    const listener = vi.fn();
    cmp.subscribe(listener);

    updateControllerState({property: 'new value'});
    const [firstListener] = registeredListeners();
    firstListener();

    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('invoking the registered #subscribe handler does not call the listener if the state has not changed', () => {
    const listener = vi.fn();
    cmp.subscribe(listener);

    const [firstListener] = registeredListeners();
    firstListener();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('allows subscribing twice to same instance when there is a state change', () => {
    const firstListener = vi.fn();
    const secondListener = vi.fn();
    cmp.subscribe(firstListener);
    cmp.subscribe(secondListener);

    updateControllerState({property: 'new value'});

    const allListeners = registeredListeners();
    allListeners.forEach((l) => l());

    expect(firstListener).toHaveBeenCalledTimes(2);
    expect(secondListener).toHaveBeenCalledTimes(2);
  });

  describe('when several listeners are subscribed', () => {
    let engineUnsubscribe: Mock;
    let unsubscribeFirst: () => void;
    let unsubscribeSecond: () => void;

    beforeEach(() => {
      engineUnsubscribe = vi.fn();
      (engine.subscribe as Mock).mockReturnValue(engineUnsubscribe);
      unsubscribeFirst = cmp.subscribe(vi.fn());
      unsubscribeSecond = cmp.subscribe(vi.fn());
    });

    it('registers a single handler on the engine', () => {
      expect(engine.subscribe).toHaveBeenCalledTimes(1);
    });

    it('keeps the engine handler while a listener remains', () => {
      unsubscribeFirst();

      expect(engineUnsubscribe).not.toHaveBeenCalled();
    });

    it('removes the engine handler when the first listener unsubscribes last', () => {
      unsubscribeSecond();
      unsubscribeFirst();

      expect(engineUnsubscribe).toHaveBeenCalledTimes(1);
    });

    it('removes the engine handler when a later listener unsubscribes last', () => {
      unsubscribeFirst();
      unsubscribeSecond();

      expect(engineUnsubscribe).toHaveBeenCalledTimes(1);
    });

    it('registers a new engine handler when subscribing again after every listener unsubscribed', () => {
      unsubscribeFirst();
      unsubscribeSecond();
      cmp.subscribe(vi.fn());

      expect(engine.subscribe).toHaveBeenCalledTimes(2);
    });
  });
});
