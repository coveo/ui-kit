import {triggers} from '../../app/reducers';
import {logNotifyTrigger} from '../../features/triggers/trigger-analytics-actions';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine';
import {NotifyTrigger, buildNotifyTrigger} from './headless-notify-trigger';

describe('NotifyTrigger', () => {
  let engine: MockSearchEngine;
  let notifyTrigger: NotifyTrigger;

  function initNotifyTrigger() {
    notifyTrigger = buildNotifyTrigger(engine);
  }

  function setEngineTriggersState(notifications: string[]) {
    engine.state.triggers.notifications = notifications;
  }

  function getLogTriggerNotifyAction() {
    return engine.actions.find(
      (a) => a.type === logNotifyTrigger().pending.type
    );
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

  describe('when the #engine.state.triggers.notifications is not updated', () => {
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

  describe('when the #engine.state.triggers.notifications is updated', () => {
    const listener = jest.fn();
    beforeEach(() => {
      engine = buildMockSearchAppEngine();
      initNotifyTrigger();
      notifyTrigger.subscribe(listener);
      setEngineTriggersState(['hello']);
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

  describe('when the #engine.state.triggers.notifications is updated with an empty array', () => {
    const listener = jest.fn();
    beforeEach(() => {
      engine = buildMockSearchAppEngine();
      initNotifyTrigger();
      notifyTrigger.subscribe(listener);
      setEngineTriggersState([]);
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

  describe('when a non-empty #engine.state.triggers.notifications is updated with an empty array', () => {
    const listener = jest.fn();
    beforeEach(() => {
      engine = buildMockSearchAppEngine();
      setEngineTriggersState(['hello', 'world']);
      initNotifyTrigger();
      notifyTrigger.subscribe(listener);
      setEngineTriggersState([]);
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

  describe('when a non-empty #engine.state.triggers.notifications is updated with the same array', () => {
    const listener = jest.fn();
    beforeEach(() => {
      engine = buildMockSearchAppEngine();
      setEngineTriggersState(['hello', 'world']);
      initNotifyTrigger();
      notifyTrigger.subscribe(listener);
      setEngineTriggersState(['hello', 'world']);
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
