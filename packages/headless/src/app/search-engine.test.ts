import {buildSearchEngine} from './search-engine';

describe('buildSearchEngine', () => {
  it('exposes an executeFirstSearch method', () => {
    const engine = buildSearchEngine();
    expect(engine.executeFirstSearch).toBeTruthy();
  });
});
