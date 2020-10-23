import {historyReducer, getHistoryEmptyState} from './history-slice';
import {snapshot} from './history-actions';
import {Reducer} from 'redux';
import {undoable, StateWithHistory, makeHistory} from '../../app/undoable';
import {buildMockFacetRequest} from '../../test/mock-facet-request';
import {buildMockNumericFacetRequest} from '../../test/mock-numeric-facet-request';
import {buildMockDateFacetRequest} from '../../test/mock-date-facet-request';
import {buildMockCategoryFacetRequest} from '../../test/mock-category-facet-request';
import {buildMockAdvancedSearchQueriesState} from '../../test/mock-advanced-search-queries-state';
import {SearchParametersState} from '../../state/search-app-state';
import {buildMockFacetOptions} from '../../test/mock-facet-options';

describe('history slice', () => {
  let undoableReducer: Reducer<StateWithHistory<SearchParametersState>>;

  beforeEach(() => {
    undoableReducer = undoable(historyReducer, getHistoryEmptyState());
  });

  const getSnapshot = (snap: Partial<SearchParametersState>) => ({
    ...getHistoryEmptyState(),
    ...snap,
  });

  const addSnapshot = (
    snap: Partial<SearchParametersState>,
    history = makeHistory(getHistoryEmptyState())
  ) => {
    return undoableReducer(history, snapshot(getSnapshot(snap)));
  };

  const addSnapshots = (...snaps: Partial<SearchParametersState>[]) => {
    let previous = makeHistory(getHistoryEmptyState());
    snaps.forEach((s) => {
      previous = addSnapshot(s, previous);
    });
    return previous;
  };

  const expectHistoryToHaveCreatedDifferentSnapshots = (
    firstSnap: Partial<SearchParametersState>,
    secondSnap: Partial<SearchParametersState>
  ) => {
    const history = addSnapshots(firstSnap, secondSnap);
    expect(history.past.length).toBe(2);
    expect(history.past[1]).toEqual(firstSnap);
    expect(history.present).toEqual(secondSnap);
  };

  const expectHistoryNotToHaveCreatedDifferentSnapshots = (
    firstSnap: Partial<SearchParametersState>,
    secondSnap: Partial<SearchParametersState>
  ) => {
    const history = addSnapshots(firstSnap, secondSnap);
    expect(history.past.length).toBe(1);
    expect(history.past[0]).toEqual(getHistoryEmptyState());
    expect(history.present).toEqual(firstSnap);
  };

  it('allows to add a snapshot to the state', () => {
    const expectedSnapshot: SearchParametersState = {
      context: {contextValues: {foo: 'bar'}},
      facetSet: {foo: buildMockFacetRequest()},
      numericFacetSet: {bar: buildMockNumericFacetRequest()},
      dateFacetSet: {foo: buildMockDateFacetRequest()},
      categoryFacetSet: {foo: buildMockCategoryFacetRequest()},
      facetOptions: {freezeFacetOrder: false},
      pagination: {
        firstResult: 123,
        numberOfResults: 456,
        totalCountFiltered: 789,
      },
      query: {q: 'foo'},
      advancedSearchQueries: {aq: '', cq: ''},
      querySet: {foo: 'bar', hello: 'world'},
      sortCriteria: 'date descending',
      pipeline: 'my-pipeline',
      searchHub: 'my-search-hub',
    };

    expect(addSnapshot(expectedSnapshot).present).toEqual(expectedSnapshot);
  });

  describe('should not consider snapshot entry to be different', () => {
    it('for #identical snapshot', () => {
      expectHistoryNotToHaveCreatedDifferentSnapshots(
        getSnapshot({query: {q: 'foo'}}),
        getSnapshot({query: {q: 'foo'}})
      );
    });

    it('for #pagination totalCountFiltered', () => {
      expectHistoryNotToHaveCreatedDifferentSnapshots(
        getSnapshot({
          pagination: {
            numberOfResults: 1,
            totalCountFiltered: 1,
            firstResult: 1,
          },
        }),
        getSnapshot({
          pagination: {
            numberOfResults: 1,
            totalCountFiltered: 2,
            firstResult: 1,
          },
        })
      );
    });
  });

  describe('should consider snapshot entry to be different', () => {
    it('for #pipeline', () => {
      expectHistoryToHaveCreatedDifferentSnapshots(
        getSnapshot({pipeline: 'foo'}),
        getSnapshot({pipeline: 'bar'})
      );
    });

    it('for #searchHub', () => {
      expectHistoryToHaveCreatedDifferentSnapshots(
        getSnapshot({searchHub: 'foo'}),
        getSnapshot({searchHub: 'bar'})
      );
    });

    it('for #query', () => {
      expectHistoryToHaveCreatedDifferentSnapshots(
        getSnapshot({query: {q: '1'}}),
        getSnapshot({query: {q: '2'}})
      );
    });

    it('for #context keys', () => {
      expectHistoryToHaveCreatedDifferentSnapshots(
        getSnapshot({context: {contextValues: {foo: 'bar'}}}),
        getSnapshot({context: {contextValues: {foo2: 'bar'}}})
      );
    });

    it('for #context values', () => {
      expectHistoryToHaveCreatedDifferentSnapshots(
        getSnapshot({context: {contextValues: {foo: 'bar'}}}),
        getSnapshot({context: {contextValues: {foo: 'bazz'}}})
      );
    });

    it('for #facetSet keys', () => {
      expectHistoryToHaveCreatedDifferentSnapshots(
        getSnapshot({facetSet: {foo: buildMockFacetRequest()}}),
        getSnapshot({facetSet: {foo2: buildMockFacetRequest()}})
      );
    });

    it('for #dateFacetSet keys', () => {
      expectHistoryToHaveCreatedDifferentSnapshots(
        getSnapshot({dateFacetSet: {foo: buildMockDateFacetRequest()}}),
        getSnapshot({dateFacetSet: {foo2: buildMockDateFacetRequest()}})
      );
    });

    it('for #numericFacetSet keys', () => {
      expectHistoryToHaveCreatedDifferentSnapshots(
        getSnapshot({numericFacetSet: {foo: buildMockNumericFacetRequest()}}),
        getSnapshot({numericFacetSet: {foo2: buildMockNumericFacetRequest()}})
      );
    });

    it('for #categoryFacetSet keys', () => {
      expectHistoryToHaveCreatedDifferentSnapshots(
        getSnapshot({categoryFacetSet: {foo: buildMockCategoryFacetRequest()}}),
        getSnapshot({categoryFacetSet: {foo2: buildMockCategoryFacetRequest()}})
      );
    });

    it('for #facetOptions keys', () => {
      expectHistoryToHaveCreatedDifferentSnapshots(
        getSnapshot({
          facetOptions: buildMockFacetOptions({freezeFacetOrder: true}),
        }),
        getSnapshot({
          facetOptions: buildMockFacetOptions({freezeFacetOrder: false}),
        })
      );
    });

    it('should consider different snapshot for facet set values', () => {
      expectHistoryToHaveCreatedDifferentSnapshots(
        getSnapshot({facetSet: {foo: buildMockFacetRequest()}}),
        getSnapshot({
          facetSet: {foo: buildMockFacetRequest({field: '@different'})},
        })
      );
    });

    it('should consider same snapshots for sane constant query values', () => {
      expectHistoryNotToHaveCreatedDifferentSnapshots(
        getSnapshot({
          advancedSearchQueries: buildMockAdvancedSearchQueriesState({
            cq: 'hello',
          }),
        }),
        getSnapshot({
          advancedSearchQueries: buildMockAdvancedSearchQueriesState({
            cq: 'hello',
          }),
        })
      );
    });

    it('should consider different snapshot for different constant query values', () => {
      expectHistoryToHaveCreatedDifferentSnapshots(
        getSnapshot({
          advancedSearchQueries: buildMockAdvancedSearchQueriesState({
            cq: 'hello',
          }),
        }),
        getSnapshot({
          advancedSearchQueries: buildMockAdvancedSearchQueriesState({
            cq: 'world',
          }),
        })
      );
    });

    it('for #pagination number of results', () => {
      expectHistoryToHaveCreatedDifferentSnapshots(
        getSnapshot({
          pagination: {
            numberOfResults: 1,
            totalCountFiltered: 1,
            firstResult: 1,
          },
        }),
        getSnapshot({
          pagination: {
            numberOfResults: 2,
            totalCountFiltered: 1,
            firstResult: 1,
          },
        })
      );
    });

    it('for #pagination first result', () => {
      expectHistoryToHaveCreatedDifferentSnapshots(
        getSnapshot({
          pagination: {
            numberOfResults: 1,
            totalCountFiltered: 1,
            firstResult: 1,
          },
        }),
        getSnapshot({
          pagination: {
            numberOfResults: 1,
            totalCountFiltered: 1,
            firstResult: 2,
          },
        })
      );
    });

    it('for #sortCriteria', () => {
      expectHistoryToHaveCreatedDifferentSnapshots(
        getSnapshot({
          sortCriteria: '@date descending',
        }),
        getSnapshot({
          sortCriteria: '@date ascending',
        })
      );
    });
  });

  it('should not add duplicate snapshot', () => {
    const snap = getSnapshot({query: {q: 'foo'}});
    const history = addSnapshots(snap, snap);
    expect(history.past.length).toBe(1);
    expect(history.past[0]).toEqual(getHistoryEmptyState());
    expect(history.present).toEqual(snap);
  });
});
