import type {Mock} from 'vitest';
import {stateKey} from '../../../app/state-key.js';
import {commerceTriggersReducer as triggers} from '../../../features/commerce/triggers/triggers-slice.js';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  type MockedCommerceEngine,
} from '../../../test/mock-engine-v2.js';
import type {NotifyTrigger} from '../../core/triggers/headless-core-notify-trigger.js';
import {buildNotifyTrigger} from './headless-notify-trigger.js';

describe('commerce notify trigger', () => {
  let engine: MockedCommerceEngine;
  let notifyTrigger: NotifyTrigger;

  function initNotifyTrigger() {
    notifyTrigger = buildNotifyTrigger(engine);
  }

  function setEngineTriggersState(notifications: string[]) {
    engine[stateKey].triggers!.notifications = notifications;
  }

  function registeredListeners() {
    return (engine.subscribe as Mock).mock.calls.map((args) => args[0]);
  }

  beforeEach(() => {
    vi.resetAllMocks();
    engine = buildMockCommerceEngine(buildMockCommerceState());
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

  it('when the #engine.state.triggers.notifications is not updated, does not call the listener', () => {
    const listener = vi.fn();

    engine = buildMockCommerceEngine(buildMockCommerceState());
    initNotifyTrigger();
    notifyTrigger.subscribe(listener);

    const [firstListener] = registeredListeners();
    firstListener();

    expect(listener).toHaveBeenCalledTimes(0);
  });

  it('when the #engine.state.triggers.notifications is updated, calls the listener', () => {
    const listener = vi.fn();

    engine = buildMockCommerceEngine(buildMockCommerceState());
    initNotifyTrigger();
    notifyTrigger.subscribe(listener);

    setEngineTriggersState(['hello']);
    const [firstListener] = registeredListeners();
    firstListener();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('when the #engine.state.triggers.notifications is updated with an empty array, does not call the listener', () => {
    const listener = vi.fn();

    engine = buildMockCommerceEngine(buildMockCommerceState());
    initNotifyTrigger();
    notifyTrigger.subscribe(listener);

    setEngineTriggersState([]);
    const [firstListener] = registeredListeners();
    firstListener();

    expect(listener).toHaveBeenCalledTimes(0);
  });

  it('when a non-empty #engine.state.triggers.notifications is updated with an empty array, calls the listener', () => {
    const listener = vi.fn();

    engine = buildMockCommerceEngine(buildMockCommerceState());
    setEngineTriggersState(['hello', 'world']);
    initNotifyTrigger();
    notifyTrigger.subscribe(listener);

    setEngineTriggersState([]);
    const [firstListener] = registeredListeners();
    firstListener();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('when a non-empty #engine.state.triggers.notifications is updated with the same array, does not call the listener', () => {
    const listener = vi.fn();

    engine = buildMockCommerceEngine(buildMockCommerceState());
    setEngineTriggersState(['hello', 'world']);
    initNotifyTrigger();
    notifyTrigger.subscribe(listener);

    setEngineTriggersState(['hello', 'world']);
    const [firstListener] = registeredListeners();
    firstListener();

    expect(listener).toHaveBeenCalledTimes(0);
  });
});
