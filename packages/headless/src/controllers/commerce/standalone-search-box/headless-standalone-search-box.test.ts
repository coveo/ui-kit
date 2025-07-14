import {configuration} from '../../../app/common-reducers.js';
import {stateKey} from '../../../app/state-key.js';
import {updateQuery} from '../../../features/commerce/query/query-actions.js';
import {queryReducer as commerceQuery} from '../../../features/commerce/query/query-slice.js';
import {
  registerQuerySetQuery,
  updateQuerySetQuery,
} from '../../../features/commerce/query-set/query-set-actions.js';
import {selectQuerySuggestion} from '../../../features/commerce/query-suggest/query-suggest-actions.js';
import {
  fetchRedirectUrl,
  registerStandaloneSearchBox,
  resetStandaloneSearchBox,
} from '../../../features/commerce/standalone-search-box-set/standalone-search-box-set-actions.js';
import {commerceStandaloneSearchBoxSetReducer as commerceStandaloneSearchBoxSet} from '../../../features/commerce/standalone-search-box-set/standalone-search-box-set-slice.js';
// TODO: KIT-3127: import from commerce
import {querySuggestReducer as querySuggest} from '../../../features/query-suggest/query-suggest-slice.js';
import type {CommerceAppState} from '../../../state/commerce-app-state.js';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  type MockedCommerceEngine,
} from '../../../test/mock-engine-v2.js';
import {buildMockQuerySuggest} from '../../../test/mock-query-suggest.js';
import {buildMockStandaloneSearchBoxEntry} from '../../../test/mock-standalone-search-box-entry.js';
import {
  buildStandaloneSearchBox,
  type StandaloneSearchBox,
} from './headless-standalone-search-box.js';
import type {StandaloneSearchBoxOptions} from './headless-standalone-search-box-options.js';

vi.mock('../../../features/commerce/query-set/query-set-actions');
vi.mock('../../../features/commerce/query-suggest/query-suggest-actions');
vi.mock('../../../features/commerce/query/query-actions');
vi.mock(
  '../../../features/commerce/standalone-search-box-set/standalone-search-box-set-actions'
);

describe('headless standalone searchBox', () => {
  const id = 'search-box-123';
  let state: CommerceAppState;

  let engine: MockedCommerceEngine;
  let searchBox: StandaloneSearchBox;
  let options: StandaloneSearchBoxOptions;

  beforeEach(() => {
    options = {
      id,
      redirectionUrl: 'https://www.coveo.com/en/search',
    };

    initState();
    initController();
  });

  function initState() {
    state = buildMockCommerceState();
    state.querySet[id] = 'query';
    state.querySuggest[id] = buildMockQuerySuggest({id});
    state.commerceStandaloneSearchBoxSet[id] =
      buildMockStandaloneSearchBoxEntry();
  }

  function initController() {
    engine = buildMockCommerceEngine(state);
    searchBox = buildStandaloneSearchBox(engine, {options});
  }

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      commerceStandaloneSearchBoxSet,
      configuration,
      commerceQuery,
      querySuggest,
    });
  });

  it('dispatches #registerStandaloneSearchBox with the correct options', () => {
    expect(registerStandaloneSearchBox).toHaveBeenCalledWith({
      id,
      redirectionUrl: options.redirectionUrl,
      overwrite: false,
    });
  });

  it('when no id is passed, it creates an id prefixed with standalone_search_box', () => {
    options = {redirectionUrl: 'https://www.coveo.com/en/search'};
    initController();

    expect(registerQuerySetQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.stringContaining('standalone_search_box'),
      })
    );
  });

  it('when the redirectionUrl is a relative url, it does not throw', () => {
    options.redirectionUrl = '/search-page';
    expect(() => initController()).not.toThrow();
  });

  it('should return the right state', () => {
    expect(searchBox.state).toEqual({
      searchBoxId: id,
      value: state.querySet[id],
      suggestions: state.querySuggest[id]!.completions.map((completion) => ({
        value: completion.expression,
      })),
      redirectTo: '',
      isLoading: false,
      isLoadingSuggestions: false,
    });
  });

  it('#state.redirectTo uses the value in the standalone search-box reducer', () => {
    const redirectTo = '/search-page';
    engine[stateKey].commerceStandaloneSearchBoxSet![id] =
      buildMockStandaloneSearchBoxEntry({redirectTo});
    expect(searchBox.state.redirectTo).toBe(redirectTo);
  });

  describe('#updateText', () => {
    const query = 'a';

    beforeEach(() => {
      searchBox.updateText(query);
    });

    it('dispatches #updateQuerySetQuery', () => {
      expect(updateQuerySetQuery).toHaveBeenCalledWith({id, query});
    });
  });

  describe('#selectSuggestion', () => {
    it('updates the query', () => {
      const expression = 'a';
      searchBox.selectSuggestion(expression);

      expect(selectQuerySuggestion).toHaveBeenCalledWith({id, expression});
    });

    it('calls #submit', () => {
      vi.spyOn(searchBox, 'submit');
      searchBox.selectSuggestion('a');

      expect(searchBox.submit).toHaveBeenCalledTimes(1);
    });
  });

  describe('when calling submit', () => {
    it('dispatches updateQuery with the correct parameters', () => {
      const expectedQuery = state.querySet[id];
      searchBox.submit();

      expect(updateQuery).toHaveBeenCalledWith({
        query: expectedQuery,
      });
    });

    it('should dispatch a fetchRedirectUrl action', () => {
      searchBox.submit();

      expect(fetchRedirectUrl).toHaveBeenCalled();
    });
  });

  it('should dispatch a resetStandaloneSearchBox action when calling afterRedirection', () => {
    searchBox.afterRedirection();
    expect(resetStandaloneSearchBox).toHaveBeenCalledWith({id});
  });
});
