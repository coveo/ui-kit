import type {Mock} from 'vitest';
import {stateKey} from '../../../app/state-key.js';
import {commerceTriggersReducer as triggers} from '../../../features/commerce/triggers/triggers-slice.js';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  type MockedCommerceEngine,
} from '../../../test/mock-engine-v2.js';
import type {RedirectionTrigger} from '../../core/triggers/headless-core-redirection-trigger.js';
import {buildRedirectionTrigger} from './headless-redirection-trigger.js';

describe('RedirectionTrigger', () => {
  let engine: MockedCommerceEngine;
  let redirectionTrigger: RedirectionTrigger;

  function initRedirectTrigger() {
    redirectionTrigger = buildRedirectionTrigger(engine);
  }

  function registeredListeners() {
    return (engine.subscribe as Mock).mock.calls.map((args) => args[0]);
  }

  beforeEach(() => {
    engine = buildMockCommerceEngine(buildMockCommerceState());
    initRedirectTrigger();
  });

  it('initializes', () => {
    expect(redirectionTrigger).toBeTruthy();
  });

  it('adds the correct reducers to the engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      triggers,
    });
  });

  it('exposes a #subscribe method', () => {
    expect(redirectionTrigger.subscribe).toBeTruthy();
  });

  it('when the #engine.state.triggers.redirectTo is already initialized, does not call the listener', () => {
    const listener = vi.fn();
    const state = buildMockCommerceState();
    state.triggers.redirectTo = 'https://www.google.com';
    engine = buildMockCommerceEngine(state);
    initRedirectTrigger();
    redirectionTrigger.subscribe(listener);

    expect(listener).toHaveBeenCalledTimes(0);
  });

  it('when the #engine.state.triggers.redirectTo is not updated, does not call the listener', () => {
    const listener = vi.fn();
    redirectionTrigger.subscribe(listener);
    const [firstListener] = registeredListeners();
    firstListener();

    expect(listener).not.toHaveBeenCalled();
  });

  it('when the #engine.state.triggers.redirectTo is updated to the empty string, does not call the listener', () => {
    const listener = vi.fn();
    redirectionTrigger.subscribe(listener);
    engine[stateKey].triggers!.redirectTo = '';
    const [firstListener] = registeredListeners();
    firstListener();

    expect(listener).not.toHaveBeenCalled();
  });

  it('when the #engine.state.triggers.redirectTo is updated, calls the listener', () => {
    const listener = vi.fn();

    redirectionTrigger.subscribe(listener);
    engine[stateKey].triggers!.redirectTo = 'https://www.coveo.com';
    const [firstListener] = registeredListeners();
    firstListener();

    expect(listener).toHaveBeenCalledTimes(1);
  });
});
