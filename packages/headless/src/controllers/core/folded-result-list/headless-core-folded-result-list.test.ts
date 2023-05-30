import {Raw} from '../../../api/search/search/raw';
import {Result} from '../../../api/search/search/result';
import {configurationReducer as configuration} from '../../../features/configuration/configuration-slice';
import {loadCollection} from '../../../features/folding/folding-actions';
import {foldedResultAnalyticsClient} from '../../../features/folding/folding-analytics-actions';
import {foldingReducer as folding} from '../../../features/folding/folding-slice';
import {
  FoldedCollection,
  getFoldingInitialState,
} from '../../../features/folding/folding-state';
import {queryReducer as query} from '../../../features/query/query-slice';
import {searchReducer as search} from '../../../features/search/search-slice';
import {
  buildMockResult,
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../../test';
import {
  buildCoreFoldedResultList,
  FoldedResultList,
  CoreFoldedResultListProps,
  FoldedResultListOptions,
} from './headless-core-folded-result-list';

describe('FoldedResultList', () => {
  let engine: MockSearchEngine;
  let foldedResultList: FoldedResultList;
  let props: CoreFoldedResultListProps;

  function initFoldedResultList() {
    foldedResultList = buildCoreFoldedResultList(
      engine,
      props,
      foldedResultAnalyticsClient
    );
  }

  beforeEach(() => {
    const options: FoldedResultListOptions = {
      folding: {
        collectionField: 'foldingcollection',
        parentField: 'foldingparent',
        childField: 'foldingchild',
        numberOfFoldedResults: 2,
      },
    };

    props = {
      options,
      loadCollectionActionCreator: loadCollection,
    };

    engine = buildMockSearchAppEngine();
    initFoldedResultList();
  });

  it('initializes', () => {
    expect(foldedResultList).toBeTruthy();
  });

  it('adds the correct reducers to the engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      search,
      configuration,
      folding,
      query,
    });
  });

  it('exposes a #subscribe method', () => {
    expect(foldedResultList.subscribe).toBeTruthy();
  });

  it('should properly build the state', () => {
    engine.state.folding = {
      ...getFoldingInitialState(),
    };

    const expectedState = {
      results: [],
      searchResponseId: '',
      moreResultsAvailable: false,
    };

    expect(foldedResultList.state.results).toStrictEqual(expectedState.results);
    expect(foldedResultList.state.searchResponseId).toStrictEqual(
      expectedState.searchResponseId
    );
    expect(foldedResultList.state.moreResultsAvailable).toStrictEqual(
      expectedState.moreResultsAvailable
    );
  });

  it('should dispatch a #registerFolding action at initialization', () => {
    expect(engine.actions.length).toEqual(1);
    expect(engine.actions.map((action) => action.type)).toContainEqual(
      'folding/register'
    );
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

    it('#loadCollection dispatches folding/loadCollection and #logShowMoreFoldedResults analytics', () => {
      const expectedLogShowMoreAction = 'analytics/folding/showMore/pending';
      const expectedLoadCollectionAction = 'folding/loadCollection/pending';

      foldedResultList.loadCollection(foldedResultList?.state?.results[0]);

      expect(engine.actions.pop()?.type).toEqual(expectedLogShowMoreAction);
      expect(engine.actions.pop()?.type).toEqual(expectedLoadCollectionAction);
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
