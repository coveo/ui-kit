import {
  RedirectionTrigger,
  buildRedirectionTrigger,
} from './headless-redirection-trigger';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine';
import {triggers} from '../../app/reducers';
import {logTriggerRedirect} from '../../features/redirection/redirection-analytics-actions';
import {createMockState} from '../../test/mock-state';

describe('RedirectionTrigger', () => {
  let engine: MockSearchEngine;
  let redirectionTrigger: RedirectionTrigger;

  function initRedirectTrigger() {
    redirectionTrigger = buildRedirectionTrigger(engine);
  }

  function getLogTriggerRedirectAction() {
    return engine.actions.find(
      (a) => a.type === logTriggerRedirect.pending.type
    );
  }

  function registeredListeners() {
    return (engine.subscribe as jest.Mock).mock.calls.map((args) => args[0]);
  }

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
    initRedirectTrigger();
  });

  it('initializes', () => {
    expect(redirectionTrigger).toBeTruthy();
  });

  it('it adds the correct reducers to the engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      triggers,
    });
  });

  it('exposes a #subscribe method', () => {
    expect(redirectionTrigger.subscribe).toBeTruthy();
  });

  describe('when the #engine.state.triggers.redirectTo is already initialized', () => {
    const listener = jest.fn();
    beforeEach(() => {
      const state = createMockState();
      state.triggers.redirectTo = 'https://www.google.com';
      engine = buildMockSearchAppEngine({state});
      initRedirectTrigger();
      redirectionTrigger.subscribe(listener);
    });

    it('it does not call the listener', () => {
      expect(listener).toHaveBeenCalledTimes(0);
    });

    it('it does not dispatch #logTriggerRedirect', () => {
      expect(getLogTriggerRedirectAction()).toBeFalsy();
    });
  });

  describe('when the #engine.state.triggers.redirectTo is not updated', () => {
    const listener = jest.fn();
    beforeEach(() => {
      redirectionTrigger.subscribe(listener);
      const [firstListener] = registeredListeners();
      firstListener();
    });

    it('it does not call the listener', () => {
      expect(listener).not.toHaveBeenCalled();
    });

    it('it does not dispatch #logTriggerRedirect', () => {
      expect(getLogTriggerRedirectAction()).toBeFalsy();
    });
  });

  describe('when the #engine.state.triggers.redirectTo is updated to the empty string', () => {
    const listener = jest.fn();
    beforeEach(() => {
      redirectionTrigger.subscribe(listener);
      engine.state.triggers.redirectTo = '';
      const [firstListener] = registeredListeners();
      firstListener();
    });

    it('it does not call the listener', () => {
      expect(listener).not.toHaveBeenCalled();
    });

    it('it does not dispatch #logTriggerRedirect', () => {
      expect(getLogTriggerRedirectAction()).toBeFalsy();
    });
  });

  describe('when the #engine.state.triggers.redirectTo is updated', () => {
    const listener = jest.fn();
    beforeEach(() => {
      redirectionTrigger.subscribe(listener);
      engine.state.triggers.redirectTo = 'https://www.coveo.com';
      const [firstListener] = registeredListeners();
      firstListener();
    });

    it('it calls the listener', () => {
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('it dispatches #logTriggerRedirect', () => {
      expect(getLogTriggerRedirectAction()).toBeTruthy();
    });
  });
});
