import {
  buildCommerceEngine,
  CommerceEngine,
  CommerceEngineOptions,
} from './commerce-engine';
import {getSampleCommerceEngineConfiguration} from './commerce-engine-configuration';

describe('buildCommerceEngine', () => {
  let options: CommerceEngineOptions;
  let engine: CommerceEngine;

  function initEngine() {
    engine = buildCommerceEngine(options);
  }

  beforeEach(() => {
    options = {
      configuration: getSampleCommerceEngineConfiguration(),
      loggerOptions: {level: 'silent'},
    };

    initEngine();
  });

  it('works', () => {
    expect(initEngine).not.toThrow();
    expect(engine.state).toBeTruthy();
  });
});
