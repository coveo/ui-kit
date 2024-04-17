import {getSampleEngineConfiguration} from '../engine-configuration';
import {
  buildInsightEngine,
  InsightEngine,
  InsightEngineConfiguration,
  InsightEngineOptions,
} from './insight-engine';

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
      configuration: getSampleInsightEngineConfiguration(),
      loggerOptions: {level: 'silent'},
      navigatorContextProvider: () => ({
        location: 'https://www.coveo.com/',
        referrer: 'https://www.coveo.com/',
        userAgent: 'userAgent',
      }),
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

  it('exposes an #executeFirstSearch method', () => {
    expect(engine.executeFirstSearch).toBeTruthy();
  });
});
