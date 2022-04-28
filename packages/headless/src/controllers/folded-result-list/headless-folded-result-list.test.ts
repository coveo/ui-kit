import {
  FoldedResultList,
  FoldedResultListOptions,
  buildFoldedResultList,
  FoldedCollection,
} from './headless-folded-result-list';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine';
import {Result} from '../../api/search/search/result';
import {search, folding, configuration, query} from '../../app/reducers';
import {buildMockResult} from '../../test';
import {Raw} from '../../case-assist.index';

describe('FoldedResultList', () => {
  let engine: MockSearchEngine;
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
      query,
    });
  });

  it('exposes a #subscribe method', () => {
    expect(foldedResultList.subscribe).toBeTruthy();
  });

  describe('with a result and two collections', () => {
    beforeEach(() => {
      const threadResult = buildMockResult({
        uniqueId: 'thread-result',
        title: 'thread-result',
        raw: {urihash: '', foldingcollection: 'thread'},
      });
      const peopleResult = buildMockResult({
        uniqueId: 'people-result',
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

    it('dispatches analytics and folding/loadCollection when calling loadCollection', () => {
      foldedResultList.loadCollection(foldedResultList.state.results[0]);
      expect(engine.actions.pop()?.type).toEqual(
        'analytics/folding/showMore/pending'
      );
      expect(engine.actions.pop()?.type).toEqual(
        'folding/loadCollection/pending'
      );
    });

    it('finds a result by id', () => {
      const expected = foldedResultList.state.results[2];
      const result = foldedResultList.findResultById(expected);
      expect(result).toEqual(expected);
    });

    it('finds a result nested one level by id', () => {
      const expected = makeFoldedResult({
        uniqueId: 'unique_id_to_look_for',
      });
      foldedResultList.state.results[2].children.push(expected);
      const result = foldedResultList.findResultById(expected);
      expect(result).toEqual(expected);
    });

    it('finds a result nested two levels by id', () => {
      const expected = makeFoldedResult({uniqueId: 'unique_id_to_look_for'});
      const firstChild = makeFoldedResult(
        {
          uniqueId: 'first_child',
        },
        [expected]
      );
      foldedResultList.state.results[2].children.push(firstChild);
      const result = foldedResultList.findResultById(expected);
      expect(result).toEqual(expected);
    });

    it('finds a result by collection', () => {
      const expected = foldedResultList.state.results[2];
      const result = foldedResultList.findResultByCollection(expected);
      expect(result).toEqual(expected);
    });

    it('finds a result nested one level by collection', () => {
      const expected = makeFoldedResult({
        raw: {
          foldingcollection: 'collection_to_look_for',
          urihash: '',
        } as Raw,
      });
      foldedResultList.state.results[0].children.push(expected);
      const result = foldedResultList.findResultByCollection(expected);
      expect(result).toEqual(expected);
    });

    it('finds a result nested two levels by collection', () => {
      const expected = makeFoldedResult({
        raw: {
          foldingcollection: 'collection_to_look_for',
          urihash: '',
        } as Raw,
      });
      const firstChild = makeFoldedResult(
        {
          raw: {
            foldingcollection: 'first_child',
            urihash: '',
          } as Raw,
        },
        [expected]
      );
      foldedResultList.state.results[2].children.push(firstChild);
      const result = foldedResultList.findResultByCollection(expected);
      expect(result).toEqual(expected);
    });
  });
});

function makeFoldedResult(
  result: Partial<Result>,
  children: FoldedCollection[] = []
) {
  return {
    isLoadingMoreResults: true,
    moreResultsAvailable: true,
    result: result as Result,
    children: children as FoldedCollection[],
  } as FoldedCollection;
}
