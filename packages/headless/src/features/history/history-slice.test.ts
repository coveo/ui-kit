import {historyReducer, getHistoryInitialState} from './history-slice';
import {SearchParametersState} from '../../search-parameters-state';
import {snapshot} from './history-actions';
import undoable, {newHistory} from 'redux-undo';
import {StateWithHistory} from 'redux-undo';
import {Reducer} from 'redux';
import {buildMockRangeFacetRequest} from '../../test/mock-range-facet-request';
import {buildMockFacetRequest} from '../../test/mock-facet-request';

describe('history slice', () => {
  let undoableReducer: Reducer<StateWithHistory<SearchParametersState>>;

  beforeEach(() => {
    undoableReducer = undoable(historyReducer);
  });

  const getSnapshot = (snap: Partial<SearchParametersState>) => ({
    ...getHistoryInitialState(),
    ...snap,
  });

  const addSnapshot = (
    snap: Partial<SearchParametersState>,
    history = newHistory([], getHistoryInitialState(), [])
  ) => {
    return undoableReducer(history, snapshot(getSnapshot(snap)));
  };

  const addSnapshots = (...snaps: Partial<SearchParametersState>[]) => {
    let previous = newHistory([], getHistoryInitialState(), []);
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
    expect(history.past[0]).toEqual(getHistoryInitialState());
    expect(history.present).toEqual(firstSnap);
  };

  it('allows to add a snapshot to the state', () => {
    const expectedSnapshot: SearchParametersState = {
      context: {contextValues: {foo: 'bar'}},
      facetSet: {foo: buildMockFacetRequest()},
      rangeFacetSet: {bar: buildMockRangeFacetRequest()},
      pagination: {
        firstResult: 123,
        numberOfResults: 456,
        totalCountFiltered: 789,
      },
      query: {q: 'foo'},
      querySet: {foo: 'bar', hello: 'world'},
      sortCriteria: 'date descending',
      pipeline: 'my-pipeline',
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

    it('for #rangeFacetSet keys', () => {
      expectHistoryToHaveCreatedDifferentSnapshots(
        getSnapshot({rangeFacetSet: {foo: buildMockRangeFacetRequest()}}),
        getSnapshot({rangeFacetSet: {foo2: buildMockRangeFacetRequest()}})
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
    expect(history.past[0]).toEqual(getHistoryInitialState());
    expect(history.present).toEqual(snap);
  });
});
