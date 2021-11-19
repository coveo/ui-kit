import {setCaseAssistConfiguration} from '../../features/case-assist-configuration/case-assist-configuration-actions';
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
    const initialCaseAssistConfiguration = {
      caseAssistID: '',
      locale: 'en-US',
    };
    engine.dispatch(
      setCaseAssistConfiguration({caseAssistId: 'newID', locale: 'fr-CA'})
    );
    expect(engine.state.caseAssistConfiguration).not.toBe(
      initialCaseAssistConfiguration
    );
  });
});
