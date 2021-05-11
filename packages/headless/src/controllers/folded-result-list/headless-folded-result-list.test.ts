import {buildFoldedResultList} from './headless-folded-result-list';
import {buildMockSearchAppEngine, MockEngine} from '../../test/mock-engine';
import {SearchAppState} from '../../state/search-app-state';
import {buildMockResult} from '../../test';
import {buildMockResultWithFolding} from '../../test/mock-result-with-folding';

describe('FoldedResultList', () => {
  let engine: MockEngine<SearchAppState>;

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
    engine.state.search.results = new Array(10).fill(buildMockResult());
    engine.state.folding.collections = new Array(10).fill(
      buildMockResultWithFolding()
    );
  });

  it('results contains folded results, not generic results', () => {
    const foldedResultList = buildFoldedResultList(engine);
    expect(foldedResultList.state.results).toEqual(
      engine.state.folding.collections
    );
    expect(foldedResultList.state.results).not.toEqual(
      engine.state.search.results
    );
  });
});
