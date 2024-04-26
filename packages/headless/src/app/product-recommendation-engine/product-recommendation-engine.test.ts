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

  it("it's possible to configure the searchHub", () => {
    const searchHub = 'newHub';
    options.configuration.searchHub = searchHub;
    initEngine();

    expect(engine.state.searchHub).toBe(searchHub);
  });

  it("it's possible to configure the timezone", () => {
    const timezone = 'Africa/Johannesburg';
    options.configuration.timezone = timezone;
    initEngine();

    expect(engine.state.configuration.search.timezone).toBe(timezone);
  });

  it("it's possible to configure the locale", () => {
    const locale = 'fr-CA';
    options.configuration.locale = locale;
    initEngine();

    expect(engine.state.configuration.search.locale).toBe(locale);
  });
});
