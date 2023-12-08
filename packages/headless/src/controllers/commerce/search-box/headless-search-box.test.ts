import {configuration} from '../../../app/common-reducers';
import {updateQuery} from '../../../commerce.index';
import {deselectAllBreadcrumbs} from '../../../features/breadcrumb/breadcrumb-actions';
import {selectPage} from '../../../features/commerce/pagination/pagination-actions';
import {fetchQuerySuggestions} from '../../../features/commerce/query-suggest/query-suggest-actions';
import {queryReducer as commerceQuery} from '../../../features/commerce/query/query-slice';
import {executeSearch} from '../../../features/commerce/search/search-actions';
import {commerceSearchReducer as commerceSearch} from '../../../features/commerce/search/search-slice';
import {updateFacetAutoSelection} from '../../../features/facets/generic/facet-actions';
import {
  registerQuerySetQuery,
  updateQuerySetQuery,
} from '../../../features/query-set/query-set-actions';
import {querySetReducer as querySet} from '../../../features/query-set/query-set-slice';
import {
  registerQuerySuggest,
  clearQuerySuggest,
  selectQuerySuggestion,
} from '../../../features/query-suggest/query-suggest-actions';
import {querySuggestReducer as querySuggest} from '../../../features/query-suggest/query-suggest-slice';
import {CommerceAppState} from '../../../state/commerce-app-state';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../test';
import {buildMockCommerceState} from '../../../test/mock-commerce-state';
import {buildMockQuerySuggest} from '../../../test/mock-query-suggest';
import {
  SearchBox,
  SearchBoxProps,
  SearchBoxOptions,
  buildSearchBox,
} from './headless-search-box';

describe('headless search box', () => {
  const id = 'search-box-123';
  let state: CommerceAppState;

  let engine: MockCommerceEngine;
  let searchBox: SearchBox;
  let props: SearchBoxProps;

  beforeEach(() => {
    const options: SearchBoxOptions = {
      id,
      highlightOptions: {
        notMatchDelimiters: {
          open: '<a>',
          close: '<a>',
        },
        correctionDelimiters: {
          open: '<i>',
          close: '<i>',
        },
      },
    };

    props = {
      options,
    };

    initState();
    initController();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function initState() {
    state = buildMockCommerceState();
    state.querySet[id] = 'query';
    state.querySuggest[id] = buildMockQuerySuggest({
      id,
      completions: [
        {
          expression: 'a',
          score: 0,
          executableConfidence: 0,
          highlighted: '[hi]{light}(ed)',
        },
      ],
    });
  }

  function initController() {
    engine = buildMockCommerceEngine({state});
    searchBox = buildSearchBox(engine, props);
  }

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      commerceQuery,
      querySuggest,
      configuration,
      querySet,
      commerceSearch,
    });
  });

  describe('validating options', () => {
    it(`when passing an invalid id as option
      creating the controller should throw`, () => {
      props.options!.id = 1 as unknown as string;
      expect(() => initController()).toThrow(
        'Check the options of buildSearchBox'
      );
    });

    it(`when passing an invalid highlightOptions as option
      creating the controller should throw`, () => {
      props.options!.highlightOptions = {
        notMatchDelimiters: {
          open: 1 as unknown as string,
          close: 2 as unknown as string,
        },
      };
      expect(() => initController()).toThrow();
    });
  });

  it('should return the right state', () => {
    expect(searchBox.state).toEqual({
      value: state.querySet[id],
      suggestions: state.querySuggest[id]!.completions.map((completion) => ({
        highlightedValue: '<a>hi<a>light<i>ed<i>',
        rawValue: completion.expression,
      })),
      isLoading: false,
      isLoadingSuggestions: false,
    });
  });

  it('should dispatch a registerQuerySetQuery action at initialization', () => {
    expect(engine.actions).toContainEqual(
      registerQuerySetQuery({id, query: state.commerceQuery.query!})
    );
  });

  it('should dispatch a registerQuerySuggest action at initialization', () => {
    expect(engine.actions).toContainEqual(
      registerQuerySuggest({
        id,
      })
    );
  });

  describe('when calling updateText', () => {
    it('updates the search box query in the querySet', () => {
      const text = 'query';
      searchBox.updateText(text);

      const action = updateQuerySetQuery({id, query: text});
      expect(engine.actions).toContainEqual(action);
    });

    it('should call the showSuggestions method', () => {
      jest.spyOn(searchBox, 'showSuggestions');
      searchBox.updateText('how can i fix');

      expect(searchBox.showSuggestions).toHaveBeenCalled();
    });
  });

  it(`when calling clear
      should dispatch a updateQuerySetQuery action`, () => {
    searchBox.clear();
    expect(engine.actions).toContainEqual(
      updateQuerySetQuery({id: id, query: ''})
    );
  });

  it(`when calling clear
      should dispatch a clearQuerySuggest action`, () => {
    searchBox.clear();
    expect(engine.actions).toContainEqual(clearQuerySuggest({id}));
  });

  describe('#showSuggestions', () => {
    it('dispatches fetchQuerySuggestions', async () => {
      searchBox.showSuggestions();

      const action = engine.actions.find(
        (a) => a.type === fetchQuerySuggestions.pending.type
      );
      expect(action).toEqual(
        fetchQuerySuggestions.pending(action!.meta.requestId, {id})
      );
    });
  });

  describe('#selectSuggestion', () => {
    it('dispatches a selectQuerySuggestion action', () => {
      const value = 'i like this expression';
      searchBox.selectSuggestion(value);

      expect(engine.actions).toContainEqual(
        selectQuerySuggestion({id, expression: value})
      );
    });

    it('dispatches executeSearch', () => {
      const suggestion = 'a';
      searchBox.selectSuggestion(suggestion);

      expect(engine.findAsyncAction(executeSearch.pending)).toBeTruthy();
    });
  });

  describe('when calling submit', () => {
    it('it deselects all facets', () => {
      searchBox.submit();

      expect(engine.actions).toContainEqual(deselectAllBreadcrumbs());
    });

    it('allows autoSelection', () => {
      searchBox.submit();

      expect(engine.actions).toContainEqual(
        updateFacetAutoSelection({allow: true})
      );
    });

    it('autoSelection should be allowed after deselecting facets', () => {
      searchBox.submit();

      const deselectAllBreadcrumbsIndex = engine.actions.findIndex(
        (action) => action.type === deselectAllBreadcrumbs.type
      );
      const updateFacetAutoSelectionIndex = engine.actions.findIndex(
        (action) => action.type === updateFacetAutoSelection.type
      );
      expect(deselectAllBreadcrumbsIndex).toBeLessThanOrEqual(
        updateFacetAutoSelectionIndex
      );
    });

    it('dispatches updateQuery with the correct parameters', () => {
      const expectedQuery = state.querySet[id];
      searchBox.submit();

      const action = updateQuery({
        query: expectedQuery,
      });

      expect(engine.actions).toContainEqual(action);
    });

    it('updates the page to the first one', () => {
      searchBox.submit();
      expect(engine.actions).toContainEqual(selectPage(1));
    });

    it('it dispatches an executeSearch action', () => {
      searchBox.submit();

      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
    });

    it('it dispatches a clear suggestions action', () => {
      searchBox.submit();
      expect(engine.actions).toContainEqual(clearQuerySuggest({id}));
    });
  });

  it(`when querySuggest #isLoading state is true,
    #state.isLoadingSuggestions is true`, () => {
    state.querySuggest[id]!.isLoading = true;
    expect(searchBox.state.isLoadingSuggestions).toBe(true);
  });
});
