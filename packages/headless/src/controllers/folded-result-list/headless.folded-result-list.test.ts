import {
  FoldedResultList,
  FoldedResultListOptions,
  buildFoldedResultList,
} from './headless-folded-result-list';
import {buildMockSearchAppEngine, MockEngine} from '../../test/mock-engine';
import {SearchAppState} from '../../state/search-app-state';
import {search, folding, configuration} from '../../app/reducers';
import {buildMockResult} from '../../test';

describe('FoldedResultList', () => {
  let engine: MockEngine<SearchAppState>;
  let options: FoldedResultListOptions;
  let foldedResultList: FoldedResultList;

  function initFoldedResultList() {
    foldedResultList = buildFoldedResultList(engine, {options});
  }

  beforeEach(() => {
    options = {};
    engine = buildMockSearchAppEngine();
    initFoldedResultList();
  });

  it('initializes', () => {
    expect(foldedResultList).toBeTruthy();
  });

  it('dispatches the folding/register action', () => {
    expect(engine.actions.map((action) => action.type)).toContain(
      'folding/register'
    );
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      search,
      folding,
      configuration,
    });
  });

  it('exposes a #subscribe method', () => {
    expect(foldedResultList.subscribe).toBeTruthy();
  });

  describe('with a result and two collections', () => {
    beforeEach(() => {
      const threadResult = buildMockResult({
        title: 'thread-result',
        raw: {urihash: '', foldingcollection: 'thread'},
      });
      const peopleResult = buildMockResult({
        title: 'people-result',
        raw: {urihash: '', foldingcollection: 'people'},
      });
      engine.state.folding = {
        enabled: true,
        filterFieldRange: -1234,
        fields: {
          collection: 'foldingcollection',
          parent: 'foldingparent',
          child: 'foldingchild',
        },
        collections: {
          thread: {
            isLoadingMoreResults: false,
            moreResultsAvailable: true,
            children: [],
            result: threadResult,
          },
          people: {
            isLoadingMoreResults: true,
            moreResultsAvailable: true,
            children: [],
            result: peopleResult,
          },
        },
      };
      engine.state.search.results = [
        threadResult,
        buildMockResult({title: 'extra-result'}),
        peopleResult,
      ];
    });

    it('includes results with collections', () => {
      expect(
        foldedResultList.state.results.map((result) => result.result.title)
      ).toEqual(['thread-result', 'extra-result', 'people-result']);
    });

    it('sets moreResultsAvailable to false on non-collection results', () => {
      expect(
        foldedResultList.state.results[1].moreResultsAvailable
      ).toBeFalsy();
    });

    it('dispatches folding/loadCollection when calling loadCollection', () => {
      foldedResultList.loadCollection(foldedResultList.state.results[0]);
      expect(engine.actions.pop()?.type).toEqual(
        'folding/loadCollection/pending'
      );
    });
  });
});
