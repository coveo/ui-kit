import type {Mock} from 'vitest';
import {logTriggerExecute} from '../../features/triggers/trigger-analytics-actions.js';
import {triggerReducer as triggers} from '../../features/triggers/triggers-slice.js';
import type {FunctionExecutionTrigger} from '../../features/triggers/triggers-state.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../test/mock-engine-v2.js';
import {createMockState} from '../../test/mock-state.js';
import {
  buildExecuteTrigger,
  type ExecuteTrigger,
} from './headless-execute-trigger.js';

vi.mock('../../features/triggers/trigger-analytics-actions');

describe('ExecuteTrigger', () => {
  let engine: MockedSearchEngine;
  let executeTrigger: ExecuteTrigger;

  function initExecuteTrigger() {
    executeTrigger = buildExecuteTrigger(engine);
  }

  function setEngineTriggersState(executions: FunctionExecutionTrigger[]) {
    engine.state.triggers!.executions = executions;
  }

  function registeredListeners() {
    return (engine.subscribe as Mock).mock.calls.map((args) => args[0]);
  }

  beforeEach(() => {
    vi.resetAllMocks();
    engine = buildMockSearchEngine(createMockState());
    initExecuteTrigger();
  });

  it('initializes', () => {
    expect(executeTrigger).toBeTruthy();
  });

  it('it adds the correct reducers to the engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      triggers,
    });
  });

  it('exposes a #subscribe method', () => {
    expect(executeTrigger.subscribe).toBeTruthy();
  });

  describe('when the #engine.state.triggers.executions is not updated', () => {
    const listener = vi.fn();
    beforeEach(() => {
      engine = buildMockSearchEngine(createMockState());
      initExecuteTrigger();
      executeTrigger.subscribe(listener);

      const [firstListener] = registeredListeners();
      firstListener();
    });

    it('it does not call the listener', () => {
      expect(listener).toHaveBeenCalledTimes(0);
    });

    it('it does not dispatch #logTriggerExecute', () => {
      expect(logTriggerExecute).not.toHaveBeenCalled();
    });
  });

  describe('when the #engine.state.triggers.executions is updated', () => {
    const listener = vi.fn();
    beforeEach(() => {
      engine = buildMockSearchEngine(createMockState());
      initExecuteTrigger();
      executeTrigger.subscribe(listener);
      setEngineTriggersState([
        {
          functionName: 'function',
          params: ['hi'],
        },
      ]);

      const [firstListener] = registeredListeners();
      firstListener();
    });

    it('it calls the listener', () => {
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('it dispatches #logTriggerExecute', () => {
      expect(logTriggerExecute).toHaveBeenCalled();
    });

    it('#state should be updated', () => {
      expect(executeTrigger.state.executions).toEqual([
        {functionName: 'function', params: ['hi']},
      ]);
    });
  });

  describe('when the #engine.state.triggers.executions is updated with an empty array', () => {
    const listener = vi.fn();
    beforeEach(() => {
      engine = buildMockSearchEngine(createMockState());
      initExecuteTrigger();
      executeTrigger.subscribe(listener);
      setEngineTriggersState([]);

      const [firstListener] = registeredListeners();
      firstListener();
    });

    it('it does not call the listener', () => {
      expect(listener).toHaveBeenCalledTimes(0);
    });

    it('it does not dispatch #logTriggerExecute', () => {
      expect(logTriggerExecute).not.toHaveBeenCalled();
    });
  });

  describe('when a non-empty #engine.state.triggers.executions is updated with an empty array', () => {
    const listener = vi.fn();
    beforeEach(() => {
      engine = buildMockSearchEngine(createMockState());
      setEngineTriggersState([
        {functionName: 'info', params: ['String param', 1, false]},
        {functionName: 'error', params: [2, true, 'No']},
      ]);
      initExecuteTrigger();
      executeTrigger.subscribe(listener);
      setEngineTriggersState([]);

      const [firstListener] = registeredListeners();
      firstListener();
    });

    it('it does not call the listener', () => {
      expect(listener).toHaveBeenCalledTimes(0);
    });

    it('it does not dispatch #logTriggerExecute', () => {
      expect(logTriggerExecute).not.toHaveBeenCalled();
    });
  });

  describe('when a non-empty #engine.state.triggers.executions is updated with the same array', () => {
    const listener = vi.fn();
    beforeEach(() => {
      engine = buildMockSearchEngine(createMockState());
      setEngineTriggersState([
        {functionName: 'info', params: ['String param', 1, false]},
        {functionName: 'error', params: [2, true, 'No']},
      ]);
      initExecuteTrigger();
      executeTrigger.subscribe(listener);
      setEngineTriggersState([
        {functionName: 'info', params: ['String param', 1, false]},
        {functionName: 'error', params: [2, true, 'No']},
      ]);

      const [firstListener] = registeredListeners();
      firstListener();
    });

    it('it does not call the listener', () => {
      expect(listener).toHaveBeenCalledTimes(0);
    });

    it('it does not dispatch #logTriggerExecute', () => {
      expect(logTriggerExecute).not.toHaveBeenCalled();
    });
  });
});
