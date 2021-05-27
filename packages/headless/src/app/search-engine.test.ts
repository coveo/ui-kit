import {buildSearchEngine} from './search-engine';
import {sampleSearchEngineConfiguration} from './search-engine-configuration-options';

describe('buildSearchEngine', () => {
  it('exposes an executeFirstSearch method', () => {
    const engine = buildSearchEngine({
      configuration: sampleSearchEngineConfiguration(),
    });
    expect(engine.executeFirstSearch).toBeTruthy();
  });
});
