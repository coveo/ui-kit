import {setSearchHub} from '../../features/search-hub/search-hub-actions';
import {
  buildRecommendationEngine,
  RecommendationEngine,
  RecommendationEngineOptions,
} from './recommendation-engine';
import {getSampleRecommendationEngineConfiguration} from './recommendation-engine-configuration';

describe('buildRecommendationEngine', () => {
  let options: RecommendationEngineOptions;
  let engine: RecommendationEngine;

  function initEngine() {
    engine = buildRecommendationEngine(options);
  }

  beforeEach(() => {
    options = {
      configuration: getSampleRecommendationEngineConfiguration(),
      loggerOptions: {level: 'silent'},
    };

    initEngine();
  });

  it('passing an invalid searchHub throws', () => {
    options.configuration.searchHub = '';
    expect(initEngine).toThrow();
  });

  it('passing an invalid pipeline throws', () => {
    options.configuration.pipeline = '';
    expect(initEngine).toThrow();
  });

  it('#engine.state retrieves the updated state', () => {
    const initialSearchHub = engine.state.searchHub;
    engine.dispatch(setSearchHub('newHub'));
    expect(engine.state.searchHub).not.toBe(initialSearchHub);
  });

  it("it's possible to configure the pipeline", () => {
    const pipeline = 'newPipe';
    options.configuration.pipeline = pipeline;
    initEngine();

    expect(engine.state.pipeline).toBe(pipeline);
  });

  it("it's possible to configure the searchHub", () => {
    const searchHub = 'newHub';
    options.configuration.searchHub = searchHub;
    initEngine();

    expect(engine.state.searchHub).toBe(searchHub);
  });
});
