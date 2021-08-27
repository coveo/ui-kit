import {categoryFacetSetReducer} from './category-facet-set-slice';
import {
  registerCategoryFacet,
  toggleSelectCategoryFacetValue,
  deselectAllCategoryFacetValues,
  updateCategoryFacetNumberOfValues,
  updateCategoryFacetSortCriterion,
  RegisterCategoryFacetActionCreatorPayload,
} from './category-facet-set-actions';
import {buildMockCategoryFacetRequest} from '../../../test/mock-category-facet-request';
import {change} from '../../history/history-actions';
import {buildMockCategoryFacetValue} from '../../../test/mock-category-facet-value';
import {buildMockCategoryFacetValueRequest} from '../../../test/mock-category-facet-value-request';
import * as FacetReducers from '../generic/facet-reducer-helpers';
import {CategoryFacetSortCriterion} from './interfaces/request';
import {buildMockCategoryFacetSearchResult} from '../../../test/mock-category-facet-search-result';
import {selectCategoryFacetSearchResult} from '../facet-search-set/category/category-facet-search-actions';
import {
  CategoryFacetSetState,
  getCategoryFacetSetInitialState,
} from './category-facet-set-state';
import {getHistoryInitialState} from '../../history/history-state';
import {restoreSearchParameters} from '../../search-parameters/search-parameter-actions';
import * as CategoryFacetReducerHelpers from './category-facet-reducer-helpers';
import {executeSearch} from '../../search/search-actions';
import {FacetResponse} from '../facet-set/interfaces/response';
import {buildMockSearch} from '../../../test/mock-search';
import {logSearchEvent} from '../../analytics/analytics-actions';
import {buildMockCategoryFacetResponse} from '../../../test/mock-category-facet-response';
import {buildMockCategoryFacetSlice} from '../../../test/mock-category-facet-slice';
import {deselectAllFacets} from '../generic/facet-actions';

describe('category facet slice', () => {
  const facetId = '1';
  const retrieveCount = 6;
  let state: CategoryFacetSetState;

  beforeEach(() => {
    state = getCategoryFacetSetInitialState();
  });

  it('initializes the set to an empty object', () => {
    const finalState = categoryFacetSetReducer(undefined, {type: ''});
    expect(finalState).toEqual({});
  });

  it('#registerCategoryFacet with an unregistered id adds a category facet with correct defaults', () => {
    const options: RegisterCategoryFacetActionCreatorPayload = {
      facetId,
      field: '',
    };

    const finalState = categoryFacetSetReducer(
      state,
      registerCategoryFacet(options)
    );

    expect(finalState[facetId]?.request).toEqual({
      ...options,
      currentValues: [],
      filterFacetCount: true,
      injectionDepth: 1000,
      numberOfValues: 5,
      preventAutoSelect: false,
      sortCriteria: 'occurrences',
      delimitingCharacter: ';',
      type: 'hierarchical',
      basePath: [],
      filterByBasePath: true,
    });
    expect(finalState[facetId]?.initialNumberOfValues).toBe(5);
  });

  it('#updateCategoryFacetSortCriterion sets the correct sort criterion', () => {
    const sortCriterion: CategoryFacetSortCriterion = 'alphanumeric';
    const request = buildMockCategoryFacetRequest({facetId, field: 'a'});
    state[facetId] = buildMockCategoryFacetSlice({request});

    const finalState = categoryFacetSetReducer(
      state,
      updateCategoryFacetSortCriterion({facetId, criterion: sortCriterion})
    );
    expect(finalState[facetId]?.request.sortCriteria).toBe(sortCriterion);
  });

  it('#updateCategoryFacetSortCriterion does nothing when the facetID is not registered', () => {
    const sortCriterion: CategoryFacetSortCriterion = 'alphanumeric';

    expect(() =>
      categoryFacetSetReducer(
        state,
        updateCategoryFacetSortCriterion({facetId, criterion: sortCriterion})
      )
    ).not.toThrow();
  });

  it('#registerCategoryFacet with a registered id does not overwrite a category facet', () => {
    const options: RegisterCategoryFacetActionCreatorPayload = {
      facetId,
      field: 'b',
    };

    const request = buildMockCategoryFacetRequest({facetId, field: 'a'});
    state[facetId] = buildMockCategoryFacetSlice({request});

    const finalState = categoryFacetSetReducer(
      state,
      registerCategoryFacet(options)
    );
    expect(finalState[facetId]?.request.field).toBe('a');
  });

  it('it restores the categoryFacetSet on history change', () => {
    const categoryFacetSet = {'1': buildMockCategoryFacetSlice()};
    const payload = {
      ...getHistoryInitialState(),
      categoryFacetSet,
    };

    const finalState = categoryFacetSetReducer(
      state,
      change.fulfilled(payload, '')
    );

    expect(finalState).toEqual(categoryFacetSet);
  });

  describe('#restoreSearchParameters', () => {
    it('when a facet is found in the #cf payload, it sets #currentValues to a value built from the path', () => {
      const spy = jest.spyOn(CategoryFacetReducerHelpers, 'selectPath');
      const initialNumberOfValues = 5;

      const path = ['a'];
      const request = buildMockCategoryFacetRequest();

      const cf = {geography: path};
      state['geography'] = buildMockCategoryFacetSlice({
        request,
        initialNumberOfValues,
      });

      const finalState = categoryFacetSetReducer(
        state,
        restoreSearchParameters({cf})
      );
      const a = buildMockCategoryFacetValueRequest({
        value: 'a',
        state: 'selected',
        retrieveChildren: true,
        retrieveCount: initialNumberOfValues,
      });

      expect(finalState['geography']?.request.currentValues).toEqual([a]);
      expect(spy).toHaveBeenCalled();
    });

    it('when a facet is not found in the #cf payload, it sets #currentValues to an empty array', () => {
      const spy = jest.spyOn(CategoryFacetReducerHelpers, 'selectPath');
      const initialNumberOfValues = 5;

      const cf = {};
      const request = buildMockCategoryFacetRequest();
      state['geography'] = buildMockCategoryFacetSlice({
        request,
        initialNumberOfValues,
      });

      const finalState = categoryFacetSetReducer(
        state,
        restoreSearchParameters({cf})
      );

      expect(finalState['geography']?.request.currentValues).toEqual([]);
      expect(finalState['geography']?.request.numberOfValues).toEqual(
        initialNumberOfValues
      );
      expect(spy).toHaveBeenCalled();
    });

    it('when a facet is not found in the #cf payload, it does not preventAutoSelection', () => {
      const initialNumberOfValues = 5;

      const cf = {};
      const request = buildMockCategoryFacetRequest();
      request.preventAutoSelect = false;
      state['geography'] = buildMockCategoryFacetSlice({
        request,
        initialNumberOfValues,
      });

      const finalState = categoryFacetSetReducer(
        state,
        restoreSearchParameters({cf})
      );

      expect(finalState['geography']?.request.preventAutoSelect).toBe(false);
    });

    it('when a facet is found in the #cf payload and has no values selected, it does not preventAutoSelection', () => {
      const initialNumberOfValues = 5;

      const path = [] as string[];
      const request = buildMockCategoryFacetRequest();
      request.preventAutoSelect = false;

      const cf = {geography: path};
      state['geography'] = buildMockCategoryFacetSlice({
        request,
        initialNumberOfValues,
      });

      const finalState = categoryFacetSetReducer(
        state,
        restoreSearchParameters({cf})
      );

      expect(finalState['geography']?.request.preventAutoSelect).toBe(false);
    });

    it('when a facet is found in the #cf payload and has values selected, it does preventAutoSelection', () => {
      const initialNumberOfValues = 5;

      const path = ['a'];
      const request = buildMockCategoryFacetRequest();
      request.preventAutoSelect = false;

      const cf = {geography: path};
      state['geography'] = buildMockCategoryFacetSlice({
        request,
        initialNumberOfValues,
      });

      const finalState = categoryFacetSetReducer(
        state,
        restoreSearchParameters({cf})
      );

      expect(finalState['geography']?.request.preventAutoSelect).toBe(true);
    });

    it('when a facet is found in the #cf payload, has previously selected values, and restore remove selection, it sets #currentValues to the new value', () => {
      const initialNumberOfValues = 5;

      let path = ['a', 'b'];
      const request = buildMockCategoryFacetRequest();
      let cf = {geography: path};
      state['geography'] = buildMockCategoryFacetSlice({
        request,
        initialNumberOfValues,
      });

      const intermediateState = categoryFacetSetReducer(
        state,
        restoreSearchParameters({cf})
      );

      expect(
        intermediateState['geography']?.request.currentValues[0].value
      ).toEqual('a');
      expect(
        intermediateState['geography']?.request.currentValues[0].children[0]
          .value
      ).toEqual('b');

      path = ['a'];
      cf = {geography: path};

      const finalState = categoryFacetSetReducer(
        intermediateState,
        restoreSearchParameters({cf})
      );

      expect(finalState['geography']?.request.currentValues[0].value).toEqual(
        'a'
      );
      expect(
        finalState['geography']?.request.currentValues[0].children.length
      ).toBe(0);
    });
  });

  describe('deselecting values', () => {
    const initialNumberOfValues = 5;
    const anotherFacetId = 'anotherfacet';

    beforeEach(() => {
      const request = buildMockCategoryFacetRequest({
        numberOfValues: initialNumberOfValues + 1,
        currentValues: [buildMockCategoryFacetValueRequest()],
      });
      state[facetId] = buildMockCategoryFacetSlice({
        request,
        initialNumberOfValues,
      });
      state[anotherFacetId] = buildMockCategoryFacetSlice({
        request,
        initialNumberOfValues,
      });
    });

    describe('#deselectAllCategoryFacetValues', () => {
      let newState: CategoryFacetSetState;

      beforeEach(() => {
        const action = deselectAllCategoryFacetValues(facetId);
        newState = categoryFacetSetReducer(state, action);
      });

      it('sets #currentValues to an empty array', () => {
        expect(newState[facetId]?.request.currentValues).toEqual([]);
      });

      it('sets #preventAutoSelect to true on the request', () => {
        expect(newState[facetId]?.request.preventAutoSelect).toBe(true);
      });

      it('sets the request #numberOfValues to the initial number', () => {
        expect(newState[facetId]?.request.numberOfValues).toBe(
          initialNumberOfValues
        );
      });
    });

    describe('#deselectAllFacets', () => {
      let newState: CategoryFacetSetState;
      beforeEach(() => {
        newState = categoryFacetSetReducer(state, deselectAllFacets());
      });

      it('sets #currentValues to an empty array for all facets', () => {
        expect(newState[facetId]?.request.currentValues).toEqual([]);
        expect(newState[anotherFacetId]?.request.currentValues).toEqual([]);
      });

      it('sets #preventAutoSelect to true on the request for all facets', () => {
        expect(newState[facetId]?.request.preventAutoSelect).toBe(true);
        expect(newState[anotherFacetId]?.request.preventAutoSelect).toBe(true);
      });

      it('sets the request #numberOfValues to the initial number for all facets', () => {
        expect(newState[facetId]?.request.numberOfValues).toBe(
          initialNumberOfValues
        );
        expect(newState[anotherFacetId]?.request.numberOfValues).toBe(
          initialNumberOfValues
        );
      });
    });
  });

  it('dispatching #updateCategoryFacetNumberOfValues calls #handleFacetUpdateNumberOfValues if there are no nested children', () => {
    jest.spyOn(FacetReducers, 'handleFacetUpdateNumberOfValues');
    const request = buildMockCategoryFacetRequest({facetId});
    state[facetId] = buildMockCategoryFacetSlice({request});

    categoryFacetSetReducer(
      state,
      updateCategoryFacetNumberOfValues({
        facetId: '1',
        numberOfValues: 20,
      })
    );

    expect(FacetReducers.handleFacetUpdateNumberOfValues).toHaveBeenCalledTimes(
      1
    );
  });

  it('dispatching #updateCategoryFacetNumberOfValues sets correct retrieve count to the appropriate number', () => {
    const request = buildMockCategoryFacetRequest({
      currentValues: [
        buildMockCategoryFacetValueRequest({
          value: 'test',
          state: 'selected',
          retrieveCount: 5,
        }),
      ],
    });

    state[facetId] = buildMockCategoryFacetSlice({request});
    const finalState = categoryFacetSetReducer(
      state,
      updateCategoryFacetNumberOfValues({facetId, numberOfValues: 10})
    );
    expect(finalState[facetId]?.request.currentValues[0].retrieveCount).toBe(
      10
    );
  });

  it('dispatching #updateCategoryFacetNumberOfValues should not throw when facetId does not exist', () => {
    expect(() =>
      categoryFacetSetReducer(
        state,
        updateCategoryFacetNumberOfValues({
          facetId: 'notRegistred',
          numberOfValues: 20,
        })
      )
    ).not.toThrow();
  });

  describe('#toggleSelectCategoryFacetValue', () => {
    it('when the passed id is not registered, it does not throw', () => {
      const selection = buildMockCategoryFacetValue({value: 'A'});
      const action = toggleSelectCategoryFacetValue({
        facetId,
        selection,
        retrieveCount,
      });

      expect(() => categoryFacetSetReducer(state, action)).not.toThrow();
    });

    describe('when currentValues is empty', () => {
      beforeEach(() => {
        const request = buildMockCategoryFacetRequest({
          currentValues: [],
          numberOfValues: 5,
        });

        state[facetId] = buildMockCategoryFacetSlice({request});
      });

      it('builds a request from the selection and adds it to currentValues', () => {
        const selection = buildMockCategoryFacetValue({
          value: 'A',
          path: ['A'],
        });
        const action = toggleSelectCategoryFacetValue({
          facetId,
          selection,
          retrieveCount,
        });
        const finalState = categoryFacetSetReducer(state, action);
        const currentValues = finalState[facetId]?.request.currentValues;

        expect(currentValues).toEqual([
          {
            value: selection.value,
            state: 'selected',
            children: [],
            retrieveChildren: true,
            retrieveCount,
          },
        ]);
      });

      it('sets the numberOfValues to request to 1', () => {
        const selection = buildMockCategoryFacetValue({
          value: 'A',
          path: ['A'],
        });
        const action = toggleSelectCategoryFacetValue({
          facetId,
          selection,
          retrieveCount,
        });

        const finalState = categoryFacetSetReducer(state, action);

        expect(finalState[facetId]?.request.numberOfValues).toBe(1);
      });
    });

    describe('when #currentValues contains one parent', () => {
      beforeEach(() => {
        const parent = buildMockCategoryFacetValueRequest({
          value: 'A',
          state: 'selected',
          retrieveChildren: true,
        });
        const request = buildMockCategoryFacetRequest({
          currentValues: [parent],
        });

        state[facetId] = buildMockCategoryFacetSlice({request});
      });

      describe('when the selected value path contains the parent', () => {
        const selection = buildMockCategoryFacetValue({
          value: 'B',
          path: ['A', 'B'],
        });
        const action = toggleSelectCategoryFacetValue({
          facetId,
          selection,
          retrieveCount,
        });

        it("adds the selection to the parent's children array", () => {
          const finalState = categoryFacetSetReducer(state, action);
          const expected = buildMockCategoryFacetValueRequest({
            value: selection.value,
            retrieveChildren: true,
            retrieveCount,
            state: 'selected',
          });

          const children =
            finalState[facetId]?.request.currentValues[0].children;
          expect(children).toEqual([expected]);
        });

        it('sets the parent state to idle', () => {
          const finalState = categoryFacetSetReducer(state, action);
          expect(finalState[facetId]?.request.currentValues[0].state).toBe(
            'idle'
          );
        });

        it('sets the parent retrieveChildren to false', () => {
          const finalState = categoryFacetSetReducer(state, action);
          expect(
            finalState[facetId]?.request.currentValues[0].retrieveChildren
          ).toBe(false);
        });
      });

      describe('when the selected value path does not contain the parent', () => {
        const selection = buildMockCategoryFacetValue({
          value: 'B',
          path: ['C', 'B'],
        });
        const action = toggleSelectCategoryFacetValue({
          facetId,
          selection,
          retrieveCount,
        });

        it("does not add the selection to the parent's children array", () => {
          const finalState = categoryFacetSetReducer(state, action);
          expect(
            finalState[facetId]?.request.currentValues[0].children
          ).toEqual([]);
        });

        it('keeps the parent #state to selected', () => {
          const finalState = categoryFacetSetReducer(state, action);
          expect(finalState[facetId]?.request.currentValues[0].state).toBe(
            'selected'
          );
        });

        it('keeps the parent #retrieveChildren to true', () => {
          const finalState = categoryFacetSetReducer(state, action);
          expect(
            finalState[facetId]?.request.currentValues[0].retrieveChildren
          ).toBe(true);
        });
      });
    });

    describe('when #currentValues contains two parents', () => {
      beforeEach(() => {
        const parentB = buildMockCategoryFacetValueRequest({value: 'B'});
        const parentA = buildMockCategoryFacetValueRequest({
          value: 'A',
          children: [parentB],
        });

        const request = buildMockCategoryFacetRequest({
          currentValues: [parentA],
        });
        state[facetId] = buildMockCategoryFacetSlice({request});
      });

      it(`when the selected value path contains the two parents,
      it adds the selection to the second parent's children array`, () => {
        const selection = buildMockCategoryFacetValue({
          value: 'C',
          path: ['A', 'B', 'C'],
        });
        const action = toggleSelectCategoryFacetValue({
          facetId,
          selection,
          retrieveCount,
        });
        const finalState = categoryFacetSetReducer(state, action);

        const expected = buildMockCategoryFacetValueRequest({
          value: selection.value,
          retrieveChildren: true,
          retrieveCount,
          state: 'selected',
        });

        expect(
          finalState[facetId]?.request.currentValues[0].children[0].children
        ).toEqual([expected]);
      });

      describe('when selecting a parent value', () => {
        const selection = buildMockCategoryFacetValue({
          value: 'A',
          path: ['A'],
        });
        const action = toggleSelectCategoryFacetValue({
          facetId,
          selection,
          retrieveCount,
        });

        it('clears the children array of that parent', () => {
          const finalState = categoryFacetSetReducer(state, action);
          const parent = finalState[facetId]?.request.currentValues[0];

          expect(parent?.children).toEqual([]);
        });

        it('sets parent #retrieveChildren to true', () => {
          const finalState = categoryFacetSetReducer(state, action);
          const parent = finalState[facetId]?.request.currentValues[0];

          expect(parent?.retrieveChildren).toBe(true);
        });

        it('sets parent #state to selected', () => {
          const finalState = categoryFacetSetReducer(state, action);
          const parent = finalState[facetId]?.request.currentValues[0];

          expect(parent?.state).toBe('selected');
        });
      });
    });

    it(`when selection is invalid
      should dispatch an action containing an error`, () => {
      const selection = buildMockCategoryFacetValue({
        value: 'A',
        children: [
          buildMockCategoryFacetValue({value: 'B'}),
          buildMockCategoryFacetValue({
            value: 'C',
            children: [
              buildMockCategoryFacetValue({value: 'D', numberOfResults: -1}),
            ],
          }),
        ],
      });

      const action = toggleSelectCategoryFacetValue({
        facetId,
        selection,
        retrieveCount,
      });
      expect(action.error).toBeDefined();
    });
  });

  describe('#selectCategoryFacetSearchResult', () => {
    beforeEach(() => {
      const request = buildMockCategoryFacetRequest();
      state[facetId] = buildMockCategoryFacetSlice({request});
    });

    it('when the passed id is not registered, it does not throw', () => {
      const value = buildMockCategoryFacetSearchResult();
      const action = selectCategoryFacetSearchResult({
        facetId: 'notExistant',
        value,
      });

      expect(() => categoryFacetSetReducer(state, action)).not.toThrow();
    });

    it('when the result is at the base path, currentValues only contains the selected value', () => {
      const spy = jest.spyOn(CategoryFacetReducerHelpers, 'selectPath');
      state[facetId]!.initialNumberOfValues = 10;

      const value = buildMockCategoryFacetSearchResult();
      const action = selectCategoryFacetSearchResult({
        facetId,
        value,
      });
      const nextState = categoryFacetSetReducer(state, action);

      const expectedRequest = buildMockCategoryFacetValueRequest({
        retrieveChildren: true,
        state: 'selected',
        retrieveCount: 10,
      });

      expect(nextState[facetId]?.request.currentValues.length).toEqual(1);
      expect(nextState[facetId]?.request.currentValues).toContainEqual(
        expectedRequest
      );
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('#executeSearch.fulfilled', () => {
    function buildExecuteSearchAction(facets: FacetResponse[]) {
      const search = buildMockSearch();
      search.response.facets = facets;

      return executeSearch.fulfilled(search, '', logSearchEvent({evt: 'foo'}));
    }

    it('when an invalid path is requested, it sets the request #currentValues to an empty array', () => {
      const currentValues = [
        buildMockCategoryFacetValueRequest({
          value: 'invalid',
          state: 'selected',
        }),
      ];
      const request = buildMockCategoryFacetRequest({currentValues});
      state[facetId] = buildMockCategoryFacetSlice({request});

      const facet = buildMockCategoryFacetResponse({facetId, values: []});
      const action = buildExecuteSearchAction([facet]);
      const finalState = categoryFacetSetReducer(state, action);

      expect(finalState[facetId]?.request.currentValues).toEqual([]);
    });

    it('when an valid path is requested, it does not adjust the #currentValues of the request', () => {
      const valid = buildMockCategoryFacetValueRequest({
        value: 'valid',
        state: 'selected',
      });
      const currentValues = [valid];
      const request = buildMockCategoryFacetRequest({currentValues});
      state[facetId] = buildMockCategoryFacetSlice({request});

      const root = buildMockCategoryFacetValue({
        value: 'valid',
        state: 'selected',
      });
      const facet = buildMockCategoryFacetResponse({facetId, values: [root]});

      const action = buildExecuteSearchAction([facet]);
      const finalState = categoryFacetSetReducer(state, action);

      expect(finalState[facetId]?.request.currentValues).toEqual(currentValues);
    });

    it('sets #preventAutoSelect to false', () => {
      const request = buildMockCategoryFacetRequest({preventAutoSelect: true});
      state[facetId] = buildMockCategoryFacetSlice({request});

      const facet = buildMockCategoryFacetResponse({facetId});
      const action = buildExecuteSearchAction([facet]);
      const finalState = categoryFacetSetReducer(state, action);

      expect(finalState[facetId]?.request.preventAutoSelect).toBe(false);
    });

    it('when the facet response #id does not exist in state, it does not throw', () => {
      const facet = buildMockCategoryFacetResponse({facetId});
      const action = buildExecuteSearchAction([facet]);

      expect(() => categoryFacetSetReducer(state, action)).not.toThrow();
    });
  });
});
