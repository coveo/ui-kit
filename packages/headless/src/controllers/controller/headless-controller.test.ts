import {buildController, Controller} from './headless-controller';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine';

describe('Controller', () => {
  let engine: MockSearchEngine;
  let cmp: Controller;

  function registeredListeners() {
    return (engine.subscribe as jest.Mock).mock.calls.map((args) => args[0]);
  }

  function updateControllerState(state: object) {
    jest.spyOn(cmp, 'state', 'get').mockReturnValue(state);
  }

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
    cmp = buildController(engine);
    updateControllerState({property: 'initial value'});
  });

  it('calling #subscribe invokes the passed listener immediately', () => {
    const listener = jest.fn();
    cmp.subscribe(listener);

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('calling #subscribe registers a handler on the engine', () => {
    const listener = jest.fn();
    cmp.subscribe(listener);

    expect(registeredListeners().length).toBe(1);
  });

  it('the #subscribe method returns a function', () => {
    const listener = jest.fn();
    const returnValue = cmp.subscribe(listener);

    expect(typeof returnValue).toBe('function');
  });

  it('invoking the registered #subscribe handler calls the listener if the state has changed', () => {
    const listener = jest.fn();
    cmp.subscribe(listener);

    updateControllerState({property: 'new value'});
    const [firstListener] = registeredListeners();
    firstListener();

    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('invoking the registered #subscribe handler does not call the listener if the state has not changed', () => {
    const listener = jest.fn();
    cmp.subscribe(listener);

    const [firstListener] = registeredListeners();
    firstListener();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('allows subscribing twice to same instance when there is a state change', () => {
    const firstListener = jest.fn();
    const secondListener = jest.fn();
    cmp.subscribe(firstListener);
    cmp.subscribe(secondListener);

    updateControllerState({property: 'new value'});

    const allListeners = registeredListeners();
    allListeners.forEach((l) => l());

    expect(firstListener).toHaveBeenCalledTimes(2);
    expect(secondListener).toHaveBeenCalledTimes(2);
  });
});
