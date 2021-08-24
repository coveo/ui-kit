import {
  buildProductListingEngine,
  ProductListingEngine,
  ProductListingEngineOptions,
} from './product-listing-engine';
import {getSampleProductListingEngineConfiguration} from './product-listing-engine-configuration';

describe('buildProductListingEngine', () => {
  let options: ProductListingEngineOptions;
  let engine: ProductListingEngine;

  function initEngine() {
    engine = buildProductListingEngine(options);
  }

  beforeEach(() => {
    options = {
      configuration: getSampleProductListingEngineConfiguration(),
      loggerOptions: {level: 'silent'},
    };

    initEngine();
  });

  it('works', () => {
    expect(initEngine).not.toThrow();
    expect(engine.state).toBeTruthy();
  });
});
