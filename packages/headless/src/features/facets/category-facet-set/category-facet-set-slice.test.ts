import {categoryFacetSetReducer} from './category-facet-set-slice';
import {CategoryFacetRegistrationOptions} from './interfaces/options';
import {
  registerCategoryFacet,
  toggleSelectCategoryFacetValue,
  deselectAllCategoryFacetValues,
  updateCategoryFacetNumberOfValues,
  updateCategoryFacetSortCriterion,
} from './category-facet-set-actions';
import {buildMockCategoryFacetRequest} from '../../../test/mock-category-facet-request';
import {change} from '../../history/history-actions';
import {buildMockCategoryFacetValue} from '../../../test/mock-category-facet-value';
import {buildMockCategoryFacetValueRequest} from '../../../test/mock-category-facet-value-request';
import * as FacetReducers from '../generic/facet-reducer-helpers';
import {
  CategoryFacetSortCriterion,
  CategoryFacetValueRequest,
} from './interfaces/request';
import {buildMockCategoryFacetSearchResult} from '../../../test/mock-category-facet-search-result';
import {selectCategoryFacetSearchResult} from '../facet-search-set/category/category-facet-search-actions';
import {
  CategoryFacetSetState,
  getCategoryFacetSetInitialState,
} from './category-facet-set-state';
import {deselectAllFacets} from '../generic/facet-actions';
import {getHistoryInitialState} from '../../history/history-state';

describe('category facet slice', () => {
  const facetId = '1';
  let state: CategoryFacetSetState;

  beforeEach(() => {
    state = getCategoryFacetSetInitialState();
  });

  it('initializes the set to an empty object', () => {
    const finalState = categoryFacetSetReducer(undefined, {type: ''});
    expect(finalState).toEqual({});
  });

  it('#registerCategoryFacet with an unregistered id adds a category facet with correct defaults', () => {
    const options: CategoryFacetRegistrationOptions = {
      facetId,
      field: '',
    };

    const finalState = categoryFacetSetReducer(
      state,
      registerCategoryFacet(options)
    );

    expect(finalState[facetId]).toEqual({
      ...options,
      currentValues: [],
      filterFacetCount: false,
      injectionDepth: 1000,
      numberOfValues: 5,
      preventAutoSelect: false,
      sortCriteria: 'occurrences',
      delimitingCharacter: '|',
      type: 'hierarchical',
      basePath: [],
      filterByBasePath: true,
    });
  });

  it('#updateCategoryFacetSortCriterion sets the correct sort criterion', () => {
    const sortCriterion: CategoryFacetSortCriterion = 'alphanumeric';
    state[facetId] = buildMockCategoryFacetRequest({facetId, field: 'a'});
    const finalState = categoryFacetSetReducer(
      state,
      updateCategoryFacetSortCriterion({facetId, criterion: sortCriterion})
    );
    expect(finalState[facetId].sortCriteria).toBe(sortCriterion);
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
    const options: CategoryFacetRegistrationOptions = {
      facetId,
      field: 'b',
    };

    state[facetId] = buildMockCategoryFacetRequest({facetId, field: 'a'});
    const finalState = categoryFacetSetReducer(
      state,
      registerCategoryFacet(options)
    );
    expect(finalState[facetId].field).toBe('a');
  });

  it('it restores the categoryFacetSet on history change', () => {
    const categoryFacetSet = {'1': buildMockCategoryFacetRequest()};
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

  it('#deselectAllCategoryFacetValues calls #handleFacetDeselectAll', () => {
    jest.spyOn(FacetReducers, 'handleFacetDeselectAll');
    const action = deselectAllCategoryFacetValues('1');
    categoryFacetSetReducer(state, action);

    expect(FacetReducers.handleFacetDeselectAll).toHaveBeenCalledTimes(1);
  });

  it('dispatching #deselectAllFacets calls #handleFacetDeselectAll for every category facet', () => {
    jest.spyOn(FacetReducers, 'handleFacetDeselectAll');

    state['1'] = buildMockCategoryFacetRequest();
    state['2'] = buildMockCategoryFacetRequest();
    state['3'] = buildMockCategoryFacetRequest();
    categoryFacetSetReducer(state, deselectAllFacets());

    expect(FacetReducers.handleFacetDeselectAll).toHaveBeenCalledTimes(4);
  });

  it('dispatching #updateCategoryFacetNumberOfValues calls #handleFacetUpdateNumberOfValues if there are no nested children', () => {
    jest.spyOn(FacetReducers, 'handleFacetUpdateNumberOfValues');
    state[facetId] = buildMockCategoryFacetRequest({facetId});
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
    state[facetId] = buildMockCategoryFacetRequest({
      currentValues: [
        buildMockCategoryFacetValueRequest({
          value: 'test',
          state: 'selected',
          retrieveCount: 5,
        }),
      ],
    });
    const finalState = categoryFacetSetReducer(
      state,
      updateCategoryFacetNumberOfValues({facetId, numberOfValues: 10})
    );
    expect(finalState[facetId].currentValues[0].retrieveCount).toBe(10);
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
      const action = toggleSelectCategoryFacetValue({facetId, selection});

      expect(() => categoryFacetSetReducer(state, action)).not.toThrow();
    });

    describe('when currentValues is empty', () => {
      beforeEach(() => {
        state[facetId] = buildMockCategoryFacetRequest({
          currentValues: [],
          numberOfValues: 5,
        });
      });

      it('builds a request from the selection and adds it to currentValues', () => {
        const selection = buildMockCategoryFacetValue({
          value: 'A',
          path: ['A'],
        });
        const action = toggleSelectCategoryFacetValue({facetId, selection});
        const finalState = categoryFacetSetReducer(state, action);
        const currentValues = finalState[facetId].currentValues;

        expect(currentValues).toEqual([
          {
            value: selection.value,
            state: 'selected',
            children: [],
            retrieveChildren: true,
            retrieveCount: 5,
          },
        ]);
      });

      it('sets the numberOfValues to request to 1', () => {
        const selection = buildMockCategoryFacetValue({
          value: 'A',
          path: ['A'],
        });
        const action = toggleSelectCategoryFacetValue({facetId, selection});
        const finalState = categoryFacetSetReducer(state, action);

        expect(finalState[facetId].numberOfValues).toBe(1);
      });
    });

    describe('when #currentValues contains one parent', () => {
      beforeEach(() => {
        const parent = buildMockCategoryFacetValueRequest({
          value: 'A',
          state: 'selected',
          retrieveChildren: true,
        });
        state[facetId] = buildMockCategoryFacetRequest({
          currentValues: [parent],
        });
      });

      describe('when the selected value path contains the parent', () => {
        const selection = buildMockCategoryFacetValue({
          value: 'B',
          path: ['A', 'B'],
        });
        const action = toggleSelectCategoryFacetValue({facetId, selection});

        it("adds the selection to the parent's children array", () => {
          const finalState = categoryFacetSetReducer(state, action);
          const expected = buildMockCategoryFacetValueRequest({
            value: selection.value,
            retrieveChildren: true,
            retrieveCount: 5,
            state: 'selected',
          });

          const children = finalState[facetId].currentValues[0].children;
          expect(children).toEqual([expected]);
        });

        it('sets the parent state to idle', () => {
          const finalState = categoryFacetSetReducer(state, action);
          expect(finalState[facetId].currentValues[0].state).toBe('idle');
        });

        it('sets the parent retrieveChildren to false', () => {
          const finalState = categoryFacetSetReducer(state, action);
          expect(finalState[facetId].currentValues[0].retrieveChildren).toBe(
            false
          );
        });
      });

      describe('when the selected value path does not contain the parent', () => {
        const selection = buildMockCategoryFacetValue({
          value: 'B',
          path: ['C', 'B'],
        });
        const action = toggleSelectCategoryFacetValue({facetId, selection});

        it("does not add the selection to the parent's children array", () => {
          const finalState = categoryFacetSetReducer(state, action);
          expect(finalState[facetId].currentValues[0].children).toEqual([]);
        });

        it('keeps the parent #state to selected', () => {
          const finalState = categoryFacetSetReducer(state, action);
          expect(finalState[facetId].currentValues[0].state).toBe('selected');
        });

        it('keeps the parent #retrieveChildren to true', () => {
          const finalState = categoryFacetSetReducer(state, action);
          expect(finalState[facetId].currentValues[0].retrieveChildren).toBe(
            true
          );
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

        state[facetId] = buildMockCategoryFacetRequest({
          currentValues: [parentA],
        });
      });

      it(`when the selected value path contains the two parents,
      it adds the selection to the second parent's children array`, () => {
        const selection = buildMockCategoryFacetValue({
          value: 'C',
          path: ['A', 'B', 'C'],
        });
        const action = toggleSelectCategoryFacetValue({facetId, selection});
        const finalState = categoryFacetSetReducer(state, action);

        const expected = buildMockCategoryFacetValueRequest({
          value: selection.value,
          retrieveChildren: true,
          retrieveCount: 5,
          state: 'selected',
        });

        expect(
          finalState[facetId].currentValues[0].children[0].children
        ).toEqual([expected]);
      });

      describe('when selecting a parent value', () => {
        const selection = buildMockCategoryFacetValue({
          value: 'A',
          path: ['A'],
        });
        const action = toggleSelectCategoryFacetValue({facetId, selection});

        it('clears the children array of that parent', () => {
          const finalState = categoryFacetSetReducer(state, action);
          const parent = finalState[facetId].currentValues[0];

          expect(parent.children).toEqual([]);
        });

        it('sets parent #retrieveChildren to true', () => {
          const finalState = categoryFacetSetReducer(state, action);
          const parent = finalState[facetId].currentValues[0];

          expect(parent.retrieveChildren).toBe(true);
        });

        it('sets parent #state to selected', () => {
          const finalState = categoryFacetSetReducer(state, action);
          const parent = finalState[facetId].currentValues[0];

          expect(parent.state).toBe('selected');
        });
      });
    });

    it('should throw when selection is invalid', () => {
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

      expect(() =>
        toggleSelectCategoryFacetValue({facetId, selection})
      ).toThrow();
    });
  });

  describe('#selectCategoryFacetSearchResult', () => {
    beforeEach(() => {
      state[facetId] = buildMockCategoryFacetRequest();
    });

    it('when the passed id is not registered, it does not throw', () => {
      const value = buildMockCategoryFacetSearchResult();
      const action = selectCategoryFacetSearchResult({
        facetId: 'notExistant',
        value,
      });

      expect(() => categoryFacetSetReducer(state, action)).not.toThrow();
    });

    it('when the result is at the base path currentValues only contains the selected value', () => {
      const value = buildMockCategoryFacetSearchResult();
      const expectedRequest: CategoryFacetValueRequest = buildMockCategoryFacetValueRequest(
        {
          retrieveChildren: true,
          state: 'selected',
          retrieveCount: 5,
        }
      );
      const action = selectCategoryFacetSearchResult({
        facetId,
        value,
      });
      const nextState = categoryFacetSetReducer(state, action);
      expect(nextState[facetId].currentValues.length).toEqual(1);
      expect(nextState[facetId].currentValues).toContainEqual(expectedRequest);
    });

    it('when the result is at a nested path currentValues contains the correct tree', () => {
      const value = buildMockCategoryFacetSearchResult({
        path: ['level1'],
      });
      const expectedRequest: CategoryFacetValueRequest = buildMockCategoryFacetValueRequest(
        {
          children: [
            buildMockCategoryFacetValueRequest({
              state: 'selected',
              retrieveChildren: true,
              retrieveCount: 5,
            }),
          ],
          value: 'level1',
          retrieveCount: 5,
          retrieveChildren: false,
          state: 'idle',
        }
      );
      const action = selectCategoryFacetSearchResult({
        facetId,
        value,
      });
      const nextState = categoryFacetSetReducer(state, action);
      expect(nextState[facetId].currentValues.length).toEqual(1);
      expect(nextState[facetId].currentValues).toContainEqual(expectedRequest);
    });
  });
});
