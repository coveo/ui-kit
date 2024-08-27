import {stateKey} from '../../../app/state-key';
import {commerceTriggersReducer as triggers} from '../../../features/commerce/triggers/triggers-slice';
import {buildMockCommerceState} from '../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../test/mock-engine-v2';
import {RedirectionTrigger} from '../../core/triggers/headless-core-redirection-trigger';
import {buildRedirectionTrigger} from './headless-redirection-trigger';

describe('RedirectionTrigger', () => {
  let engine: MockedCommerceEngine;
  let redirectionTrigger: RedirectionTrigger;

  function initRedirectTrigger() {
    redirectionTrigger = buildRedirectionTrigger(engine);
  }

  function registeredListeners() {
    return (engine.subscribe as jest.Mock).mock.calls.map((args) => args[0]);
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
    const listener = jest.fn();
    const state = buildMockCommerceState();
    state.triggers.redirectTo = 'https://www.google.com';
    engine = buildMockCommerceEngine(state);
    initRedirectTrigger();
    redirectionTrigger.subscribe(listener);

    expect(listener).toHaveBeenCalledTimes(0);
  });

  it('when the #engine.state.triggers.redirectTo is not updated, does not call the listener', () => {
    const listener = jest.fn();
    redirectionTrigger.subscribe(listener);
    const [firstListener] = registeredListeners();
    firstListener();

    expect(listener).not.toHaveBeenCalled();
  });

  it('when the #engine.state.triggers.redirectTo is updated to the empty string, does not call the listener', () => {
    const listener = jest.fn();
    redirectionTrigger.subscribe(listener);
    engine[stateKey].triggers!.redirectTo = '';
    const [firstListener] = registeredListeners();
    firstListener();

    expect(listener).not.toHaveBeenCalled();
  });

  it('when the #engine.state.triggers.redirectTo is updated, calls the listener', () => {
    const listener = jest.fn();

    redirectionTrigger.subscribe(listener);
    engine[stateKey].triggers!.redirectTo = 'https://www.coveo.com';
    const [firstListener] = registeredListeners();
    firstListener();

    expect(listener).toHaveBeenCalledTimes(1);
  });
});
