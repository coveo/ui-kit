import {search, configuration, folding, query} from '../../../app/reducers';
import {
  loadCollection,
  registerFolding,
} from '../../../features/folding/folding-actions';
import {
  foldedResultAnalyticsClient,
  logShowMoreFoldedResults,
  logShowLessFoldedResults,
} from '../../../features/folding/folding-analytics-actions';
import {getFoldingInitialState} from '../../../features/folding/folding-state';
import {buildMockSearchAppEngine, MockSearchEngine} from '../../../test';
import {
  buildCoreFoldedResultList,
  CoreFoldedResultList,
} from './headless-core-folded-result-list';

describe('FoldedResultList', () => {
  let engine: MockSearchEngine;
  let foldedResultList: CoreFoldedResultList;
  let props: any; // change later

  function initFoldedResultList() {
    foldedResultList = buildCoreFoldedResultList(
      engine,
      props,
      foldedResultAnalyticsClient
    );
  }

  beforeEach(() => {
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

  // TODO
  it('should dispatch a #registerFolding action at initialization', () => {
    expect(engine.actions.length).toEqual(1);
    expect(engine.actions).toContainEqual(
      registerFolding({
        collectionField: '',
        parentField: '',
        childField: '',
        numberOfFoldedResults: 99,
      })
    );
  });

  // TODO
  it('#loadCollection dispatches #loadCollection and #logShowMoreFoldedResults with the correct payload', () => {
    const mockCollection = {};
    const mockResult = {};
    foldedResultList.loadCollection(mockCollection); // to fix
    expect(engine.actions).toContainEqual(loadCollection('')); // todo : pass collection
    expect(engine.actions).toContainEqual(logShowMoreFoldedResults(mockResult)); // to fix
  });

  // TODO
  it('#logShowMoreFoldedResults dispatches #logShowMoreFoldedResults with the correct payload', () => {
    const mockResult = {};
    foldedResultList.logShowMoreFoldedResults(mockResult);
    expect(engine.actions).toContainEqual(logShowMoreFoldedResults(mockResult));
  });

  it('#logShowLessFoldedResults dispatches #logShowLessFoldedResults with the correct payload', () => {
    foldedResultList.logShowLessFoldedResults();
    expect(engine.actions).toContainEqual(logShowLessFoldedResults());
  });

  // TODO
  it('#findResultById should return the right result for a given Id', () => {
    const mockResults = [
      {
        result: {uniqueId: 'id1'},
        children: [],
      },
      {
        result: {uniqueId: 'id2'},
        children: [],
      },
    ];
    const mockCollection = {result: {uniqueId: 'id2'}};
    const result = foldedResultList.findResultById(mockCollection); // to fix

    expect(result).toEqual(mockResults[1]);
  });

  // TODO
  it('#findResultByCollection should return the right result for a given Collection', () => {
    const mockResults = [
      {
        result: {raw: {foldingcollection: 'collection1'}},
        children: [],
      },
      {
        result: {raw: {foldingcollection: 'collection2'}},
        children: [],
      },
    ];
    const mockCollection = {result: {raw: {foldingcollection: 'collection2'}}};
    const result = foldedResultList.findResultByCollection(mockCollection); // to fix

    expect(result).toEqual(mockResults[1]);
  });

  it('should properly build the state', () => {
    // TO FIX LATER:
    engine.state.folding = {
      ...getFoldingInitialState(),
      collections: {}, // insert exampleCollections here
    };

    // to change later
    const expectedState = {
      results: [],
      searchResponseId: '123',
      moreResultsAvailable: true,
    };

    expect(foldedResultList.state.results).toStrictEqual(expectedState.results);
    expect(foldedResultList.state.searchResponseId).toStrictEqual(
      expectedState.searchResponseId
    );
    expect(foldedResultList.state.moreResultsAvailable).toStrictEqual(
      expectedState.moreResultsAvailable
    );
  });
});
