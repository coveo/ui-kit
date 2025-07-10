import type {Mock} from 'vitest';
import {logTriggerRedirect} from '../../features/triggers/trigger-analytics-actions.js';
import {triggerReducer as triggers} from '../../features/triggers/triggers-slice.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../test/mock-engine-v2.js';
import {createMockState} from '../../test/mock-state.js';
import type {RedirectionTrigger} from '../core/triggers/headless-core-redirection-trigger.js';
import {buildRedirectionTrigger} from './headless-redirection-trigger.js';

vi.mock('../../features/triggers/trigger-analytics-actions');

describe('RedirectionTrigger', () => {
  let engine: MockedSearchEngine;
  let redirectionTrigger: RedirectionTrigger;

  function initRedirectTrigger() {
    redirectionTrigger = buildRedirectionTrigger(engine);
  }

  function registeredListeners() {
    return (engine.subscribe as Mock).mock.calls.map((args) => args[0]);
  }

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
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
    const listener = vi.fn();
    beforeEach(() => {
      const state = createMockState();
      state.triggers.redirectTo = 'https://www.google.com';
      engine = buildMockSearchEngine(state);
      initRedirectTrigger();
      redirectionTrigger.subscribe(listener);
    });

    it('it does not call the listener', () => {
      expect(listener).toHaveBeenCalledTimes(0);
    });

    it('it does not dispatch #logTriggerRedirect', () => {
      expect(logTriggerRedirect).not.toHaveBeenCalled();
    });
  });

  describe('when the #engine.state.triggers.redirectTo is not updated', () => {
    const listener = vi.fn();
    beforeEach(() => {
      redirectionTrigger.subscribe(listener);
      const [firstListener] = registeredListeners();
      firstListener();
    });

    it('it does not call the listener', () => {
      expect(listener).not.toHaveBeenCalled();
    });

    it('it does not dispatch #logTriggerRedirect', () => {
      expect(logTriggerRedirect).not.toHaveBeenCalled();
    });
  });

  describe('when the #engine.state.triggers.redirectTo is updated to the empty string', () => {
    const listener = vi.fn();
    beforeEach(() => {
      redirectionTrigger.subscribe(listener);
      engine.state.triggers!.redirectTo = '';
      const [firstListener] = registeredListeners();
      firstListener();
    });

    it('it does not call the listener', () => {
      expect(listener).not.toHaveBeenCalled();
    });

    it('it does not dispatch #logTriggerRedirect', () => {
      expect(logTriggerRedirect).not.toHaveBeenCalled();
    });
  });

  describe('when the #engine.state.triggers.redirectTo is updated', () => {
    const listener = vi.fn();
    beforeEach(() => {
      redirectionTrigger.subscribe(listener);
      engine.state.triggers!.redirectTo = 'https://www.coveo.com';
      const [firstListener] = registeredListeners();
      firstListener();
    });

    it('it calls the listener', () => {
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('it dispatches #logTriggerRedirect', () => {
      expect(logTriggerRedirect).toHaveBeenCalled();
    });
  });
});
