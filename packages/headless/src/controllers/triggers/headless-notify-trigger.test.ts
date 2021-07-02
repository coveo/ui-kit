import {NotifyTrigger, buildNotifyTrigger} from './headless-notify-trigger';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine';
import {triggers} from '../../app/reducers';
import {logNotifyTrigger} from '../../features/triggers/trigger-analytics-actions';

describe('NotifyTrigger', () => {
  let engine: MockSearchEngine;
  let notifyTrigger: NotifyTrigger;

  function initNotifyTrigger() {
    notifyTrigger = buildNotifyTrigger(engine);
  }

  function getLogTriggerNotifyAction() {
    return engine.actions.find((a) => a.type === logNotifyTrigger.pending.type);
  }

  function registeredListeners() {
    return (engine.subscribe as jest.Mock).mock.calls.map((args) => args[0]);
  }

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
    initNotifyTrigger();
  });

  it('initializes', () => {
    expect(notifyTrigger).toBeTruthy();
  });

  it('it adds the correct reducers to the engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      triggers,
    });
  });

  it('exposes a #subscribe method', () => {
    expect(notifyTrigger.subscribe).toBeTruthy();
  });

  describe('when the #engine.state.triggers.notify is not updated', () => {
    const listener = jest.fn();
    beforeEach(() => {
      engine = buildMockSearchAppEngine();
      initNotifyTrigger();
      notifyTrigger.subscribe(listener);
      const [firstListener] = registeredListeners();
      firstListener();
    });

    it('it does not call the listener', () => {
      expect(listener).toHaveBeenCalledTimes(0);
    });

    it('it does not dispatch #logNotifyTrigger', () => {
      expect(getLogTriggerNotifyAction()).toBeFalsy();
    });
  });

  describe('when the #engine.state.triggers.notify is updated', () => {
    const listener = jest.fn();
    beforeEach(() => {
      engine = buildMockSearchAppEngine();
      initNotifyTrigger();
      notifyTrigger.subscribe(listener);
      engine.state.triggers.notification = 'hello';
      const [firstListener] = registeredListeners();
      firstListener();
    });

    it('it calls the listener', () => {
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('it dispatches #logNotifyTrigger', () => {
      expect(getLogTriggerNotifyAction()).toBeTruthy();
    });
  });

  describe('when the #engine.state.triggers.notify is updated with an empty string', () => {
    const listener = jest.fn();
    beforeEach(() => {
      engine = buildMockSearchAppEngine();
      initNotifyTrigger();
      notifyTrigger.subscribe(listener);
      engine.state.triggers.notification = '';
      const [firstListener] = registeredListeners();
      firstListener();
    });

    it('it does not call the listener', () => {
      expect(listener).toHaveBeenCalledTimes(0);
    });

    it('it does not dispatch #logNotifyTrigger', () => {
      expect(getLogTriggerNotifyAction()).toBeFalsy();
    });
  });
});
