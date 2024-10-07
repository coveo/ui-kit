import {getSampleEngineConfiguration} from '../engine-configuration.js';
import {CaseAssistEngineConfiguration} from './case-assist-engine-configuration.js';
import {
  buildCaseAssistEngine,
  CaseAssistEngine,
  CaseAssistEngineOptions,
} from './case-assist-engine.js';

function getSampleCaseAssistEngineConfiguration(): CaseAssistEngineConfiguration {
  return {
    ...getSampleEngineConfiguration(),
    caseAssistId: 'sample-case-assist-id',
    locale: 'fr-CA',
  };
}

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

  it('sets the case assist ID correctly', () => {
    expect(engine.state.caseAssistConfiguration?.caseAssistId).toEqual(
      options.configuration.caseAssistId
    );
  });

  it('sets the locale correctly', () => {
    expect(engine.state.caseAssistConfiguration?.locale).toEqual(
      options.configuration.locale
    );
  });
});
