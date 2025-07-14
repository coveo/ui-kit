import type {Mock} from 'vitest';
import {logNotifyTrigger} from '../../../features/triggers/trigger-analytics-actions.js';
import {triggerReducer as triggers} from '../../../features/triggers/triggers-slice.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../test/mock-engine-v2.js';
import {createMockState} from '../../../test/mock-state.js';
import type {NotifyTrigger} from '../../core/triggers/headless-core-notify-trigger.js';
import {buildCoreNotifyTrigger} from './headless-core-notify-trigger.js';

vi.mock('../../../features/triggers/trigger-analytics-actions');

describe('NotifyTrigger', () => {
  let engine: MockedSearchEngine;
  let notifyTrigger: NotifyTrigger;

  function initNotifyTrigger() {
    notifyTrigger = buildCoreNotifyTrigger(engine, {
      options: {
        logNotifyTriggerActionCreator: logNotifyTrigger,
      },
    });
  }

  function setEngineTriggersState(notifications: string[]) {
    engine.state.triggers!.notifications = notifications;
  }

  function registeredListeners() {
    return (engine.subscribe as Mock).mock.calls.map((args) => args[0]);
  }

  beforeEach(() => {
    vi.resetAllMocks();
    engine = buildMockSearchEngine(createMockState());
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
    const listener = vi.fn();
    beforeEach(() => {
      engine = buildMockSearchEngine(createMockState());
      initNotifyTrigger();
      notifyTrigger.subscribe(listener);
      const [firstListener] = registeredListeners();
      firstListener();
    });

    it('it does not call the listener', () => {
      expect(listener).toHaveBeenCalledTimes(0);
    });

    it('it does not dispatch #logNotifyTrigger', () => {
      expect(logNotifyTrigger).not.toHaveBeenCalled();
    });
  });

  describe('when the #engine.state.triggers.notifications is updated', () => {
    const listener = vi.fn();
    beforeEach(() => {
      engine = buildMockSearchEngine(createMockState());
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
      expect(logNotifyTrigger).toHaveBeenCalled();
    });
  });

  describe('when the #engine.state.triggers.notifications is updated with an empty array', () => {
    const listener = vi.fn();
    beforeEach(() => {
      engine = buildMockSearchEngine(createMockState());
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
      expect(logNotifyTrigger).not.toHaveBeenCalled();
    });
  });

  describe('when a non-empty #engine.state.triggers.notifications is updated with an empty array', () => {
    const listener = vi.fn();
    beforeEach(() => {
      engine = buildMockSearchEngine(createMockState());
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
      expect(logNotifyTrigger).toHaveBeenCalled();
    });
  });

  describe('when a non-empty #engine.state.triggers.notifications is updated with the same array', () => {
    const listener = vi.fn();
    beforeEach(() => {
      engine = buildMockSearchEngine(createMockState());
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
      expect(logNotifyTrigger).not.toHaveBeenCalled();
    });
  });
});
