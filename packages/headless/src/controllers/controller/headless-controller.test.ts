import type {Mock} from 'vitest';
import {buildMockCommerceState} from '../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  buildMockFrankensteinEngine,
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../test/mock-engine-v2.js';
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

  describe('engine support validation', () => {
    it('does not throw when no supportedEngines option is provided', () => {
      const searchEngine = buildMockSearchEngine(createMockState());
      expect(() => buildController(searchEngine)).not.toThrow();
    });

    it('does not throw when supportedEngines is an empty array', () => {
      const searchEngine = buildMockSearchEngine(createMockState());
      expect(() =>
        buildController(searchEngine, {supportedEngines: []})
      ).not.toThrow();
    });

    it('does not throw when search engine is used with a controller supporting search', () => {
      const searchEngine = buildMockSearchEngine(createMockState());
      expect(() =>
        buildController(searchEngine, {supportedEngines: ['search']})
      ).not.toThrow();
    });

    it('does not throw when commerce engine is used with a controller supporting commerce', () => {
      const commerceEngine = buildMockCommerceEngine(buildMockCommerceState());
      expect(() =>
        buildController(commerceEngine, {supportedEngines: ['commerce']})
      ).not.toThrow();
    });

    it('throws when search engine is used with a controller only supporting commerce', () => {
      const searchEngine = buildMockSearchEngine(createMockState());
      expect(() =>
        buildController(searchEngine, {supportedEngines: ['commerce']})
      ).toThrow(
        'This controller does not support the "search" engine. Supported engine types: [commerce].'
      );
    });

    it('throws when commerce engine is used with a controller only supporting search', () => {
      const commerceEngine = buildMockCommerceEngine(buildMockCommerceState());
      expect(() =>
        buildController(commerceEngine, {supportedEngines: ['search']})
      ).toThrow(
        'This controller does not support the "commerce" engine. Supported engine types: [search].'
      );
    });

    it('does not throw when search engine is used with a controller supporting search and frankenstein', () => {
      const searchEngine = buildMockSearchEngine(createMockState());
      expect(() =>
        buildController(searchEngine, {
          supportedEngines: ['search', 'frankenstein'],
        })
      ).not.toThrow();
    });

    it('does not throw when commerce engine is used with a controller supporting commerce and frankenstein', () => {
      const commerceEngine = buildMockCommerceEngine(buildMockCommerceState());
      expect(() =>
        buildController(commerceEngine, {
          supportedEngines: ['commerce', 'frankenstein'],
        })
      ).not.toThrow();
    });
  });

  describe('Frankenstein engine sub-engine routing', () => {
    it('routes to search sub-engine when controller supports search and frankenstein engine is used', () => {
      const searchEngine = buildMockSearchEngine(createMockState());
      const frankensteinEngine = buildMockFrankensteinEngine(searchEngine);

      const controller = buildController(
        frankensteinEngine as Parameters<typeof buildController>[0],
        {
          supportedEngines: ['search', 'frankenstein'],
        }
      );

      controller.subscribe(() => {});

      expect(searchEngine.subscribe).toHaveBeenCalled();
    });

    it('routes to commerce sub-engine when controller supports commerce and frankenstein engine is used', () => {
      const commerceEngine = buildMockCommerceEngine(buildMockCommerceState());
      const frankensteinEngine = buildMockFrankensteinEngine(
        undefined,
        commerceEngine
      );

      const controller = buildController(
        frankensteinEngine as Parameters<typeof buildController>[0],
        {
          supportedEngines: ['commerce', 'frankenstein'],
        }
      );

      controller.subscribe(() => {});

      expect(commerceEngine.subscribe).toHaveBeenCalled();
    });

    it('does not route to sub-engine when controller only supports frankenstein', () => {
      const searchEngine = buildMockSearchEngine(createMockState());
      const frankensteinEngine = buildMockFrankensteinEngine(searchEngine);

      const controller = buildController(
        frankensteinEngine as Parameters<typeof buildController>[0],
        {
          supportedEngines: ['frankenstein'],
        }
      );

      controller.subscribe(() => {});

      expect(frankensteinEngine.subscribe).toHaveBeenCalled();
      expect(searchEngine.subscribe).not.toHaveBeenCalled();
    });
  });
});
