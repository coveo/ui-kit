import {historyReducer} from './history-slice';
import {redo, snapshot, undo} from './history-actions';
import {Reducer} from 'redux';
import {undoable, StateWithHistory, makeHistory} from '../../app/undoable';
import {buildMockFacetRequest} from '../../test/mock-facet-request';
import {buildMockNumericFacetRequest} from '../../test/mock-numeric-facet-request';
import {buildMockDateFacetRequest} from '../../test/mock-date-facet-request';
import {buildMockAdvancedSearchQueriesState} from '../../test/mock-advanced-search-queries-state';
import {buildMockQueryState} from '../../test/mock-query-state';
import {buildMockCategoryFacetSlice} from '../../test/mock-category-facet-slice';
import {getHistoryInitialState, HistoryState} from './history-state';
import {buildMockCategoryFacetRequest} from '../../test/mock-category-facet-request';
import {buildMockCategoryFacetValueRequest} from '../../test/mock-category-facet-value-request';
import {buildMockTabSlice} from '../../test/mock-tab-state';
import {buildMockStaticFilterSlice} from '../../test/mock-static-filter-slice';
import {buildMockStaticFilterValue} from '../../test/mock-static-filter-value';

describe('history slice', () => {
  let undoableReducer: Reducer<StateWithHistory<HistoryState>>;

  beforeEach(() => {
    undoableReducer = undoable({
      reducer: historyReducer,
      actionTypes: {
        redo: redo.type,
        undo: undo.type,
        snapshot: snapshot.type,
      },
    });
  });

  const getSnapshot = (snap: Partial<HistoryState>) => ({
    ...getHistoryInitialState(),
    ...snap,
  });

  const addSnapshot = (
    snap: Partial<HistoryState>,
    history = makeHistory(getHistoryInitialState())
  ) => {
    return undoableReducer(history, snapshot(getSnapshot(snap)));
  };

  const addSnapshots = (...snaps: Partial<HistoryState>[]) => {
    let previous = makeHistory(getHistoryInitialState());
    snaps.forEach((s) => {
      previous = addSnapshot(s, previous);
    });
    return previous;
  };

  const expectHistoryToHaveCreatedDifferentSnapshots = (
    firstSnap: Partial<HistoryState>,
    secondSnap: Partial<HistoryState>
  ) => {
    const history = addSnapshots(firstSnap, secondSnap);
    expect(history.past.length).toBe(2);
    expect(history.past[1]).toEqual(firstSnap);
    expect(history.present).toEqual(secondSnap);
  };

  const expectHistoryNotToHaveCreatedDifferentSnapshots = (
    firstSnap: Partial<HistoryState>,
    secondSnap: Partial<HistoryState>
  ) => {
    const history = addSnapshots(firstSnap, secondSnap);
    expect(history.past.length).toBe(1);
    expect(history.past[0]).toEqual(getHistoryInitialState());
    expect(history.present).toEqual(firstSnap);
  };

  it('allows to add a snapshot to the state', () => {
    const expectedSnapshot: HistoryState = {
      context: {contextValues: {foo: 'bar'}},
      dictionaryFieldContext: {contextValues: {price: 'cad'}},
      tabSet: {a: buildMockTabSlice({id: 'a'})},
      staticFilterSet: {a: buildMockStaticFilterSlice({id: 'a'})},
      facetSet: {foo: buildMockFacetRequest()},
      numericFacetSet: {bar: buildMockNumericFacetRequest()},
      dateFacetSet: {foo: buildMockDateFacetRequest()},
      categoryFacetSet: {foo: buildMockCategoryFacetSlice()},
      facetOptions: {freezeFacetOrder: false, facets: {}},
      pagination: {
        firstResult: 123,
        numberOfResults: 456,
        totalCountFiltered: 789,
      },
      query: buildMockQueryState({q: 'foo'}),
      advancedSearchQueries: {
        aq: '',
        cq: '',
        lq: '',
        aqWasSet: false,
        cqWasSet: false,
        lqWasSet: false,
        defaultFilters: {aq: '', cq: '', lq: ''},
      },
      querySet: {foo: 'bar', hello: 'world'},
      sortCriteria: 'date descending',
      pipeline: 'my-pipeline',
      searchHub: 'my-search-hub',
      facetOrder: [],
      debug: false,
    };

    expect(addSnapshot(expectedSnapshot).present).toEqual(expectedSnapshot);
  });

  describe('should not consider snapshot entry to be different', () => {
    it('for #identical snapshot', () => {
      const query = buildMockQueryState({q: 'foo'});
      expectHistoryNotToHaveCreatedDifferentSnapshots(
        getSnapshot({query}),
        getSnapshot({query})
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

    it('for #query.q', () => {
      expectHistoryToHaveCreatedDifferentSnapshots(
        getSnapshot({query: buildMockQueryState({q: '1'})}),
        getSnapshot({query: buildMockQueryState({q: '2'})})
      );
    });

    it('for #query.enableQuerySyntax', () => {
      expectHistoryToHaveCreatedDifferentSnapshots(
        getSnapshot({query: buildMockQueryState({enableQuerySyntax: true})}),
        getSnapshot({query: buildMockQueryState({enableQuerySyntax: false})})
      );
    });

    it('for #debug', () => {
      expectHistoryToHaveCreatedDifferentSnapshots(
        getSnapshot({debug: true}),
        getSnapshot({debug: false})
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

    it('for #dictionaryFieldContext keys', () => {
      expectHistoryToHaveCreatedDifferentSnapshots(
        getSnapshot({dictionaryFieldContext: {contextValues: {price: 'cad'}}}),
        getSnapshot({
          dictionaryFieldContext: {contextValues: {geography: 'qc'}},
        })
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
        getSnapshot({categoryFacetSet: {foo: buildMockCategoryFacetSlice()}}),
        getSnapshot({categoryFacetSet: {foo2: buildMockCategoryFacetSlice()}})
      );
    });

    it('should consider different snapshot for facet set selected values', () => {
      expectHistoryToHaveCreatedDifferentSnapshots(
        getSnapshot({facetSet: {foo: buildMockFacetRequest()}}),
        getSnapshot({
          facetSet: {
            foo: buildMockFacetRequest({
              currentValues: [{state: 'selected', value: 'good'}],
            }),
          },
        })
      );
    });

    it('should not consider different snapshot for facet set idle values', () => {
      expectHistoryNotToHaveCreatedDifferentSnapshots(
        getSnapshot({facetSet: {foo: buildMockFacetRequest()}}),
        getSnapshot({
          facetSet: {
            foo: buildMockFacetRequest({
              currentValues: [{state: 'idle', value: 'good'}],
            }),
          },
        })
      );
    });

    it('should consider different snapshot for category facet set selected values', () => {
      expectHistoryToHaveCreatedDifferentSnapshots(
        getSnapshot({categoryFacetSet: {foo: buildMockCategoryFacetSlice()}}),
        getSnapshot({
          categoryFacetSet: {
            foo: buildMockCategoryFacetSlice({
              request: buildMockCategoryFacetRequest({
                currentValues: [
                  buildMockCategoryFacetValueRequest({state: 'selected'}),
                ],
              }),
            }),
          },
        })
      );
    });

    it('should not consider different snapshot for category facet set idle values', () => {
      expectHistoryNotToHaveCreatedDifferentSnapshots(
        getSnapshot({categoryFacetSet: {foo: buildMockCategoryFacetSlice()}}),
        getSnapshot({
          categoryFacetSet: {
            foo: buildMockCategoryFacetSlice({
              request: buildMockCategoryFacetRequest({
                currentValues: [
                  buildMockCategoryFacetValueRequest({state: 'idle'}),
                ],
              }),
            }),
          },
        })
      );
    });

    it('when #tabSet has different active tabs, it creates different snaphots', () => {
      const tabA = buildMockTabSlice({id: 'a'});
      const tabB = buildMockTabSlice({id: 'b'});

      const snapshot1 = getSnapshot({
        tabSet: {
          a: {...tabA, isActive: true},
          b: {...tabB, isActive: false},
        },
      });

      const snapshot2 = getSnapshot({
        tabSet: {
          a: {...tabA, isActive: false},
          b: {...tabB, isActive: true},
        },
      });

      expectHistoryToHaveCreatedDifferentSnapshots(snapshot1, snapshot2);
    });

    it('when #tabSet has the same active tab, it does not create different snaphots', () => {
      const tabA = buildMockTabSlice({id: 'a', isActive: true});
      const tabB = buildMockTabSlice({id: 'b', isActive: false});

      const snapshot1 = getSnapshot({tabSet: {a: tabA}});
      const snapshot2 = getSnapshot({tabSet: {a: tabA, b: tabB}});

      expectHistoryNotToHaveCreatedDifferentSnapshots(snapshot1, snapshot2);
    });

    it('#staticFilterSet with different selected values creates different snapshots', () => {
      const value = buildMockStaticFilterValue();

      const snapshot1 = getSnapshot({
        staticFilterSet: {
          a: buildMockStaticFilterSlice({
            values: [{...value, state: 'idle'}],
          }),
        },
      });

      const snapshot2 = getSnapshot({
        staticFilterSet: {
          a: buildMockStaticFilterSlice({
            values: [{...value, state: 'selected'}],
          }),
        },
      });

      expectHistoryToHaveCreatedDifferentSnapshots(snapshot1, snapshot2);
    });

    it('#staticFilterSet with no difference in selected values does not create different snapshots', () => {
      const snapshot1 = getSnapshot({
        staticFilterSet: {
          a: buildMockStaticFilterSlice(),
        },
      });

      const snapshot2 = getSnapshot({
        staticFilterSet: {
          a: buildMockStaticFilterSlice(),
        },
      });

      expectHistoryNotToHaveCreatedDifferentSnapshots(snapshot1, snapshot2);
    });

    it('should consider same snapshots for same constant query values', () => {
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
    const snap = getSnapshot({query: buildMockQueryState({q: 'foo'})});
    const history = addSnapshots(snap, snap);
    expect(history.past.length).toBe(1);
    expect(history.past[0]).toEqual(getHistoryInitialState());
    expect(history.present).toEqual(snap);
  });
});
