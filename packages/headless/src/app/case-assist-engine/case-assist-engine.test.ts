import {setCaseAssistId} from '../../features/case-assist/case-assist-actions';
import {
  buildCaseAssistEngine,
  CaseAssistEngine,
  CaseAssistEngineOptions,
} from './case-assist-engine';
import {getSampleCaseAssistEngineConfiguration} from './case-assist-engine-configuration';

describe('buildCaseAssistEngine', () => {
  let options: CaseAssistEngineOptions;
  let engine: CaseAssistEngine;

  function initEngine() {
    engine = buildCaseAssistEngine(options);
  }

  beforeEach(() => {
    options = {
      configuration: getSampleCaseAssistEngineConfiguration(),
      loggerOptions: {level: 'silent'},
    };

    initEngine();
  });

  it('passing an invalid case assist ID throws', () => {
    options.configuration.caseAssistId = '';
    expect(initEngine).toThrow();
  });

  it('#engine.state retrieves the updated state', () => {
    const initialCaseAssistId = engine.state.caseAssist.caseAssistId;
    engine.dispatch(setCaseAssistId({id: 'newID'}));
    expect(engine.state.caseAssist.caseAssistId).not.toBe(initialCaseAssistId);
  });

  it("it's possible to configure the case assist ID", () => {
    const caseAssistId = 'newCaseAssistId';
    options.configuration.caseAssistId = caseAssistId;
    initEngine();

    expect(engine.state.caseAssist.caseAssistId).toBe(caseAssistId);
  });
});
