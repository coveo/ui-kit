import {
  RedirectionTrigger,
  buildRedirectionTrigger,
  RedirectionTriggerState,
} from './headless-redirection-trigger';
import {buildMockSearchAppEngine, MockEngine} from '../../test/mock-engine';
import {SearchAppState} from '../../state/search-app-state';
import {redirection, configuration} from '../../app/reducers';
import {logTriggerRedirect} from '../../features/redirection/redirection-analytics-actions';

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

  function updateControllerState(state: RedirectionTriggerState) {
    jest.spyOn(redirectionTrigger, 'state', 'get').mockReturnValue(state);
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
      redirection,
      configuration,
    });
  });

  it('exposes a #subscribe method', () => {
    expect(redirectionTrigger.subscribe).toBeTruthy();
  });

  it('when the #engine.state.redirection.redirectTo is already initialized, it calls #onRedirect and dispatches #logTriggerRedirect', () => {
    const listener = jest.fn();
    engine.state.redirection.redirectTo = 'https://www.google.com';
    redirectionTrigger.subscribe(listener);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(getLogTriggerRedirectAction()).toBeTruthy();
  });

  it('when the #engine.state.redirection.redirectTo is not updated, it does not call #onRedirect and does not dispatch #logTriggerRedirect', () => {
    const listener = jest.fn();
    redirectionTrigger.subscribe(listener);

    expect(listener).not.toHaveBeenCalled();
    expect(getLogTriggerRedirectAction()).toBeFalsy();
  });

  it('when the #engine.state.redirection.redirectTo is updated, it calls #onRedirect and dispatches #logTriggerRedirect', () => {
    const listener = jest.fn();
    engine.state.redirection.redirectTo = 'https://www.google.com';
    redirectionTrigger.subscribe(listener);
    updateControllerState({redirectTo: 'https://www.coveo.com'});

    expect(listener).toHaveBeenCalledTimes(2);
    expect(getLogTriggerRedirectAction()).toBeTruthy();
  });
});
