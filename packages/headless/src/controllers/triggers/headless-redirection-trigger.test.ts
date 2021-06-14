import {
  RedirectionTrigger,
  buildRedirectionTrigger,
} from './headless-redirection-trigger';
import {buildMockSearchAppEngine, MockEngine} from '../../test/mock-engine';
import {SearchAppState} from '../../state/search-app-state';
import {redirection, configuration} from '../../app/reducers';
import {logTriggerRedirect} from '../../features/redirection/redirection-analytics-actions';

describe('RedirectionTrigger', () => {
  let engine: MockEngine<SearchAppState>;
  let redirectionTrigger: RedirectionTrigger;
  let spyObject: {
    onRedirect: () => void;
  };

  function initRedirectTrigger() {
    redirectionTrigger = buildRedirectionTrigger(engine);
  }

  function getLogTriggerRedirectAction() {
    return engine.actions.find(
      (a) => a.type === logTriggerRedirect.pending.type
    );
  }

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
    initRedirectTrigger();
    spyObject = {
      onRedirect: () => {
        console.log('yooo');
      },
    };
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

  it('when the #engine.state.redirection.redirectTo is updated, it calls #onRedirect and dispatches #logTriggerRedirect', () => {
    jest.spyOn(spyObject, 'onRedirect');
    engine.state.redirection.redirectTo = 'a';
    console.log('engine: ', engine.state.redirection);
    console.log('controller', redirectionTrigger.state);
    redirectionTrigger.subscribe(spyObject.onRedirect);
    engine.state.redirection.redirectTo = 'https://www.coveo.com';
    console.log('engine: ', engine.state.redirection);
    console.log('controller', redirectionTrigger.state);

    expect(spyObject.onRedirect).toHaveBeenCalled();
    expect(getLogTriggerRedirectAction()).toBeTruthy();
  });

  it('when the #engine.state.redirection.redirectTo is not updated, it does not call #onRedirect and dispatch #logTriggerRedirect', () => {
    jest.spyOn(spyObject, 'onRedirect');
    engine.state.redirection.redirectTo = 'https://www.coveo.com';
    redirectionTrigger.subscribe(spyObject.onRedirect);

    expect(spyObject.onRedirect).not.toHaveBeenCalled();
    expect(getLogTriggerRedirectAction()).toBeFalsy();
  });
});
