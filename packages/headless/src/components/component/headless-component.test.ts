import {Component} from './headless-component';
import {buildMockEngine, MockEngine} from '../../test/mock-engine';

class TestComponent extends Component {}

describe('Component', () => {
  let engine: MockEngine;
  let cmp: TestComponent;

  function registeredListeners() {
    return (engine.subscribe as jest.Mock).mock.calls.map((args) => args[0]);
  }

  beforeEach(() => {
    engine = buildMockEngine();
    cmp = new TestComponent(engine);
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

  it('invoking the registered #subscribe handler calls the listener', () => {
    const listener = jest.fn();
    cmp.subscribe(listener);

    const [firstListener] = registeredListeners();
    firstListener();

    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('the #subscribe method returns a function', () => {
    const listener = jest.fn();
    const returnValue = cmp.subscribe(listener);

    expect(typeof returnValue).toBe('function');
  });
});
