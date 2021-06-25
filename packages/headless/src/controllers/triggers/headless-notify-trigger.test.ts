import {NotifyTrigger, buildNotifyTrigger} from './headless-notify-trigger';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine';
import {triggers, configuration} from '../../app/reducers';
import {clearNotifyTrigger} from '../../features/triggers/trigger-actions';
import {logNotifyTrigger} from '../../features/triggers/trigger-analytics-actions';

describe('NotifyTrigger', () => {
  let engine: MockSearchEngine;
  let notifyTrigger: NotifyTrigger;

  function initNotifyTrigger() {
    notifyTrigger = buildNotifyTrigger(engine);
  }

  function getClearNotifyTriggerAction() {
    return engine.actions.find((a) => a.type === clearNotifyTrigger.type);
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
      configuration,
    });
  });

  it('exposes a #subscribe method', () => {
    expect(notifyTrigger.subscribe).toBeTruthy();
  });

  it('when the #engine.state.triggers.notify is not updated, it does not dispatch #clearNotifyTrigger and #logNotifyTrigger', () => {
    const listener = jest.fn();
    notifyTrigger.subscribe(listener);

    const [firstListener] = registeredListeners();
    firstListener();

    expect(listener).toHaveBeenCalledTimes(0);
    expect(getLogTriggerNotifyAction()).toBeFalsy();
    expect(getClearNotifyTriggerAction()).toBeFalsy();
  });

  it('when the #engine.state.triggers.notify is updated, it dispatches #clearNotifyTrigger and #logNotifyTrigger', () => {
    const listener = jest.fn();
    notifyTrigger.subscribe(listener);

    engine.state.triggers.notify = 'hello';
    const [firstListener] = registeredListeners();
    firstListener();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(getLogTriggerNotifyAction()).toBeTruthy();
    expect(getClearNotifyTriggerAction()).toBeTruthy();
  });

  it('when the #engine.state.triggers.notify is updated to the empty string, it does not dispatch #clearNotifyTrigger and #logNotifyTrigger', () => {
    const listener = jest.fn();
    notifyTrigger.subscribe(listener);

    engine.state.triggers.notify = '';
    const [firstListener] = registeredListeners();
    firstListener();

    expect(listener).toHaveBeenCalledTimes(0);
    expect(getLogTriggerNotifyAction()).toBeFalsy();
    expect(getClearNotifyTriggerAction()).toBeFalsy();
  });
});
