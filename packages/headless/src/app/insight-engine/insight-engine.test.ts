import {getSampleEngineConfiguration} from '../engine-configuration.js';
import {
  buildInsightEngine,
  InsightEngine,
  InsightEngineConfiguration,
  InsightEngineOptions,
} from './insight-engine.js';

function getSampleInsightEngineConfiguration(): InsightEngineConfiguration {
  return {
    ...getSampleEngineConfiguration(),
    insightId: 'sample-insight-id',
  };
}

describe('buildInsightEngine', () => {
  let options: InsightEngineOptions;
  let engine: InsightEngine;

  function initEngine() {
    engine = buildInsightEngine(options);
  }

  beforeEach(() => {
    options = {
      configuration: {
        ...getSampleInsightEngineConfiguration(),
        search: {
          locale: 'en-US',
        },
      },
      loggerOptions: {level: 'silent'},
    };

    initEngine();
  });

  it('passing an invalid insight ID throws', () => {
    options.configuration.insightId = '';
    expect(initEngine).toThrow();
  });

  it('sets the insight ID correctly', () => {
    expect(engine.state.insightConfiguration?.insightId).toEqual(
      options.configuration.insightId
    );
  });

  it('sets the locale correctly', () => {
    expect(engine.state.configuration?.search?.locale).toEqual('en-US');
  });

  it('exposes an #executeFirstSearch method', () => {
    expect(engine.executeFirstSearch).toBeTruthy();
  });
});
