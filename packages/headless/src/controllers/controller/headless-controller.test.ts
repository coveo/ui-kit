import {buildController, Controller} from './headless-controller';
import {buildMockEngine, MockEngine} from '../../test/mock-engine';

describe('Controller', () => {
  let engine: MockEngine;
  let cmp: Controller;

  function registeredListeners() {
    return (engine.subscribe as jest.Mock).mock.calls.map((args) => args[0]);
  }

  beforeEach(() => {
    engine = buildMockEngine();
    cmp = buildController(engine);
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

    const [firstListener] = registeredListeners();
    jest.spyOn(cmp, 'state', 'get').mockReturnValue({foo: 'bar'});
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
});
