import {ExecuteTrigger, buildExecuteTrigger} from './headless-execute-trigger';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine';
import {triggers} from '../../app/reducers';
import {logTriggerExecute} from '../../features/triggers/trigger-analytics-actions';

describe('ExecuteTrigger', () => {
  let engine: MockSearchEngine;
  let executeTrigger: ExecuteTrigger;

  function initExecuteTrigger() {
    executeTrigger = buildExecuteTrigger(engine);
  }

  function registeredListeners() {
    return (engine.subscribe as jest.Mock).mock.calls.map((args) => args[0]);
  }

  function getLogTriggerExecuteAction() {
    return engine.actions.find(
      (a) => a.type === logTriggerExecute.pending.type
    );
  }

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
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

  describe('when the #engine.state.triggers.execute is not updated', () => {
    const listener = jest.fn();
    beforeEach(() => {
      engine = buildMockSearchAppEngine();
      initExecuteTrigger();
      executeTrigger.subscribe(listener);

      const [firstListener] = registeredListeners();
      firstListener();
    });

    it('it does not call the listener', () => {
      expect(listener).toHaveBeenCalledTimes(0);
    });

    it('it does not dispatch #logTriggerExecute', () => {
      expect(getLogTriggerExecuteAction()).toBeFalsy();
    });
  });

  describe('when the #engine.state.triggers.execute is updated', () => {
    const listener = jest.fn();
    beforeEach(() => {
      engine = buildMockSearchAppEngine();
      initExecuteTrigger();
      executeTrigger.subscribe(listener);
      engine.state.triggers.execute = {name: 'function', params: ['hi']};

      const [firstListener] = registeredListeners();
      firstListener();
    });

    it('it calls the listener', () => {
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('it dispatches #executeSearch and #logTriggerExecute', () => {
      expect(getLogTriggerExecuteAction()).toBeTruthy();
    });

    it('#state should be updated', () => {
      expect(executeTrigger.state.name).toEqual('function');
      expect(executeTrigger.state.params).toEqual(['hi']);
    });
  });

  describe('when the #engine.state.triggers.excute.name is updated with an empty string', () => {
    const listener = jest.fn();
    beforeEach(() => {
      engine = buildMockSearchAppEngine();
      initExecuteTrigger();
      executeTrigger.subscribe(listener);
      engine.state.triggers.execute.name = '';

      const [firstListener] = registeredListeners();
      firstListener();
    });

    it('it does not call the listener', () => {
      expect(listener).toHaveBeenCalledTimes(0);
    });

    it('it does not dispatch #logTriggerExecute', () => {
      expect(getLogTriggerExecuteAction()).toBeFalsy();
    });
  });
});
