import {logTriggerExecute} from '../../features/triggers/trigger-analytics-actions';
import {triggerReducer as triggers} from '../../features/triggers/triggers-slice';
import {FunctionExecutionTrigger} from '../../features/triggers/triggers-state';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../test/mock-engine-v2';
import {createMockState} from '../../test/mock-state';
import {ExecuteTrigger, buildExecuteTrigger} from './headless-execute-trigger';

jest.mock('../../features/triggers/trigger-analytics-actions');

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
    return (engine.subscribe as jest.Mock).mock.calls.map((args) => args[0]);
  }

  beforeEach(() => {
    jest.resetAllMocks();
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
    const listener = jest.fn();
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
    const listener = jest.fn();
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
    const listener = jest.fn();
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
    const listener = jest.fn();
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
    const listener = jest.fn();
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
