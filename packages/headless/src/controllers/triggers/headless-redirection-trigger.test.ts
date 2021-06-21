import {
  RedirectionTrigger,
  buildRedirectionTrigger,
} from './headless-redirection-trigger';
import {buildMockSearchAppEngine, MockEngine} from '../../test/mock-engine';
import {SearchAppState} from '../../state/search-app-state';
import {triggers, configuration} from '../../app/reducers';
import {logTriggerRedirect} from '../../features/redirection/redirection-analytics-actions';
import {createMockState} from '../../test/mock-state';

describe('RedirectionTrigger', () => {
  let engine: MockEngine<SearchAppState>;
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
      configuration,
    });
  });

  it('exposes a #subscribe method', () => {
    expect(redirectionTrigger.subscribe).toBeTruthy();
  });

  it('when the #engine.state.triggers.redirectTo is already initialized, it does not call #onRedirect and does not dispatch #logTriggerRedirect', () => {
    const listener = jest.fn();
    const state = createMockState();
    state.triggers.redirectTo = 'https://www.google.com';
    engine = buildMockSearchAppEngine({state});
    initRedirectTrigger();

    redirectionTrigger.subscribe(listener);

    expect(listener).toHaveBeenCalledTimes(0);
    expect(getLogTriggerRedirectAction()).toBeFalsy();
  });

  it('when the #engine.state.triggers.redirectTo is not updated, it does not call #onRedirect and does not dispatch #logTriggerRedirect', () => {
    const listener = jest.fn();
    redirectionTrigger.subscribe(listener);

    expect(listener).not.toHaveBeenCalled();
    expect(getLogTriggerRedirectAction()).toBeFalsy();
  });

  it('when the #engine.state.triggers.redirectTo is updated, it calls #onRedirect and dispatches #logTriggerRedirect', () => {
    const listener = jest.fn();
    redirectionTrigger.subscribe(listener);

    engine.state.triggers.redirectTo = 'https://www.coveo.com';
    const [firstListener] = registeredListeners();
    firstListener();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(getLogTriggerRedirectAction()).toBeTruthy();
  });
});
