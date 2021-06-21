import {setSearchHub} from '../../features/search-hub/search-hub-actions';
import {
  buildProductRecommendationEngine,
  ProductRecommendationEngine,
  ProductRecommendationEngineOptions,
} from './product-recommendation-engine';
import {getSampleProductRecommendationEngineConfiguration} from './product-recommendation-engine-configuration';

describe('buildProductRecommendationEngine', () => {
  let options: ProductRecommendationEngineOptions;
  let engine: ProductRecommendationEngine;

  function initEngine() {
    engine = buildProductRecommendationEngine(options);
  }

  beforeEach(() => {
    options = {
      configuration: getSampleProductRecommendationEngineConfiguration(),
      loggerOptions: {level: 'silent'},
    };

    initEngine();
  });

  it('passing an invalid searchHub throws', () => {
    options.configuration.searchHub = '';
    expect(initEngine).toThrow();
  });

  it('#engine.state retrieves the updated state', () => {
    const initialSearchHub = engine.state.searchHub;
    engine.dispatch(setSearchHub('newHub'));
    expect(engine.state.searchHub).not.toBe(initialSearchHub);
  });
});
