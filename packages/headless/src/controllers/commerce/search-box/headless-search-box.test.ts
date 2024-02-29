import {configuration} from '../../../app/common-reducers';
import {deselectAllBreadcrumbs} from '../../../features/breadcrumb/breadcrumb-actions';
import {selectPage} from '../../../features/commerce/pagination/pagination-actions';
import {fetchQuerySuggestions} from '../../../features/commerce/query-suggest/query-suggest-actions';
import {updateQuery} from '../../../features/commerce/query/query-actions';
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
import {buildMockCommerceState} from '../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../test/mock-engine-v2';
import {buildMockQuerySuggest} from '../../../test/mock-query-suggest';
import {
  SearchBox,
  SearchBoxProps,
  SearchBoxOptions,
  buildSearchBox,
} from './headless-search-box';

jest.mock('../../../features/query-suggest/query-suggest-actions');
jest.mock('../../../features/commerce/query-suggest/query-suggest-actions');
jest.mock('../../../features/commerce/search/search-actions');
jest.mock('../../../features/query-set/query-set-actions');
jest.mock('../../../features/facets/generic/facet-actions');
jest.mock('../../../features/breadcrumb/breadcrumb-actions');
jest.mock('../../../features/commerce/pagination/pagination-actions');
jest.mock('../../../features/commerce/query/query-actions');

describe('headless search box', () => {
  const id = 'search-box-123';
  let state: CommerceAppState;

  let engine: MockedCommerceEngine;
  let searchBox: SearchBox;
  let props: SearchBoxProps;

  beforeEach(() => {
    jest.resetAllMocks();
    const options: SearchBoxOptions = {
      id,
      highlightOptions: {
        notMatchDelimiters: {
          open: '<a>',
          close: '</a>',
        },
        correctionDelimiters: {
          open: '<i>',
          close: '</i>',
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
    engine = buildMockCommerceEngine(state);
    searchBox = buildSearchBox(engine, props);
  }

  it('initializes', () => {
    expect(searchBox).toBeTruthy();
  });

  it('exposes #subscribe method', () => {
    expect(searchBox.subscribe).toBeTruthy();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      commerceQuery,
      querySuggest,
      configuration,
      querySet,
      commerceSearch,
    });
  });

  describe('validate options', () => {
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

  describe('#state', () => {
    it('is as expected', () => {
      expect(searchBox.state).toEqual({
        value: state.querySet[id],
        suggestions: state.querySuggest[id]!.completions.map((completion) => ({
          highlightedValue: '<a>hi</a>light<i>ed</i>',
          rawValue: completion.expression,
        })),
        isLoading: false,
        isLoadingSuggestions: false,
      });
    });

    it(`when querySuggest #isLoading is true,
    #state.isLoadingSuggestions is true`, () => {
      state.querySuggest[id]!.isLoading = true;
      expect(searchBox.state.isLoadingSuggestions).toBe(true);
    });
  });

  describe('upon initialization', () => {
    it('dispatches #registerQuerySetQuery', () => {
      expect(registerQuerySetQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          id,
        })
      );
    });

    it('dispatches #registerQuerySuggest', () => {
      expect(registerQuerySuggest).toHaveBeenCalledWith({id});
    });
  });

  describe('#updateText', () => {
    it('updates the search box query in the querySet', () => {
      const text = 'query';
      searchBox.updateText(text);

      expect(updateQuerySetQuery).toHaveBeenCalledWith({id, query: text});
    });

    it('calls #showSuggestions', () => {
      jest.spyOn(searchBox, 'showSuggestions');
      searchBox.updateText('how can i fix');

      expect(searchBox.showSuggestions).toHaveBeenCalled();
    });
  });

  describe('#clear', () => {
    beforeEach(() => {
      searchBox.clear();
    });

    it('dispatches #updateQuerySetQuery', () => {
      expect(updateQuerySetQuery).toHaveBeenCalledWith({id, query: ''});
    });

    it('dispatches #clearQuerySuggest', () => {
      expect(clearQuerySuggest).toHaveBeenCalledWith({id});
    });
  });

  describe('#showSuggestions', () => {
    it('dispatches #fetchQuerySuggestions', async () => {
      searchBox.showSuggestions();
      expect(fetchQuerySuggestions).toHaveBeenCalledWith({id});
    });
  });

  describe('#selectSuggestion', () => {
    it('dispatches #selectQuerySuggestion', () => {
      const value = 'i like this expression';
      searchBox.selectSuggestion(value);
      expect(selectQuerySuggestion).toHaveBeenCalledWith({
        id,
        expression: value,
      });
    });

    it('dispatches #executeSearch', () => {
      const suggestion = 'a';
      searchBox.selectSuggestion(suggestion);
      expect(executeSearch).toHaveBeenCalled();
    });
  });

  describe('#submit', () => {
    beforeEach(() => {
      searchBox.submit();
    });

    it('when clearFilters option is true, dispatches #deselectAllBreadcrumbs', () => {
      expect(deselectAllBreadcrumbs).toHaveBeenCalled();
    });

    it('when clearFilters option is false, does not dispatch #deselectAllBreadcrumbs', () => {
      jest.resetAllMocks();
      engine = buildMockCommerceEngine(state);
      searchBox = buildSearchBox(engine, {
        ...props,
        options: {clearFilters: false},
      });
      searchBox.submit();
      expect(deselectAllBreadcrumbs).not.toHaveBeenCalled();
    });

    it('dispatches #updateFacetAutoSelection with proper payload', () => {
      expect(updateFacetAutoSelection).toHaveBeenCalledWith({allow: true});
    });

    it('allows autoSelection after deselecting facets', () => {
      expect(deselectAllBreadcrumbs).toHaveBeenCalled();
      expect(updateFacetAutoSelection).toHaveBeenCalled();
    });

    it('dispatches #updateQuery', () => {
      const expectedQuery = state.querySet[id];

      expect(updateQuery).toHaveBeenCalledWith({query: expectedQuery});
    });

    it('updates the page to the first one', () => {
      expect(selectPage).toHaveBeenCalledWith(0);
    });

    it('dispatches #executeSearch', () => {
      expect(executeSearch).toHaveBeenCalled();
    });

    it('dispatches #clearQuerySuggest', () => {
      searchBox.submit();
      expect(clearQuerySuggest).toHaveBeenCalledWith({id});
    });
  });
});
