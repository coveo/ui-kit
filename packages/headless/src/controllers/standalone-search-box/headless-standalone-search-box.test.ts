import {configuration} from '../../app/common-reducers';
import {
  registerQuerySetQuery,
  updateQuerySetQuery,
} from '../../features/query-set/query-set-actions';
import {selectQuerySuggestion} from '../../features/query-suggest/query-suggest-actions';
import {querySuggestReducer as querySuggest} from '../../features/query-suggest/query-suggest-slice';
import {updateQuery} from '../../features/query/query-actions';
import {queryReducer as query} from '../../features/query/query-slice';
import {
  fetchRedirectUrl,
  registerStandaloneSearchBox,
  resetStandaloneSearchBox,
  updateAnalyticsToOmniboxFromLink,
  updateAnalyticsToSearchFromLink,
} from '../../features/standalone-search-box-set/standalone-search-box-set-actions';
import {standaloneSearchBoxSetReducer as standaloneSearchBoxSet} from '../../features/standalone-search-box-set/standalone-search-box-set-slice';
import {StandaloneSearchBoxAnalytics} from '../../features/standalone-search-box-set/standalone-search-box-set-state';
import {SearchAppState} from '../../state/search-app-state';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../test/mock-engine-v2';
import {buildMockOmniboxSuggestionMetadata} from '../../test/mock-omnibox-suggestion-metadata';
import {buildMockQuerySuggest} from '../../test/mock-query-suggest';
import {buildMockStandaloneSearchBoxEntry} from '../../test/mock-standalone-search-box-entry';
import {createMockState} from '../../test/mock-state';
import {
  buildStandaloneSearchBox,
  StandaloneSearchBox,
  StandaloneSearchBoxOptions,
} from './headless-standalone-search-box';

jest.mock('../../features/query-set/query-set-actions');
jest.mock('../../features/query-suggest/query-suggest-actions');
jest.mock('../../features/query/query-actions');
jest.mock(
  '../../features/standalone-search-box-set/standalone-search-box-set-actions'
);

describe('headless standalone searchBox', () => {
  const id = 'search-box-123';
  let state: SearchAppState;

  let engine: MockedSearchEngine;
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
    state = createMockState();
    state.querySet[id] = 'query';
    state.querySuggest[id] = buildMockQuerySuggest({id});
    state.standaloneSearchBoxSet[id] = buildMockStandaloneSearchBoxEntry();
  }

  function initController() {
    engine = buildMockSearchEngine(state);
    searchBox = buildStandaloneSearchBox(engine, {options});
  }

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      standaloneSearchBoxSet,
      configuration,
      query,
      querySuggest,
    });
  });

  it('dispatches #registerStandaloneSearchBox with the correct options', () => {
    expect(registerStandaloneSearchBox).toHaveBeenCalledWith({
      id,
      redirectionUrl: options.redirectionUrl,
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

  it('when configuring an invalid option, it throws an error', () => {
    options.numberOfSuggestions = '1' as unknown as number;
    expect(() => initController()).toThrow(
      'Check the options of buildStandaloneSearchBox'
    );
  });

  it('when the redirectionUrl is a relative url, it does not throw', () => {
    options.redirectionUrl = '/search-page';
    expect(() => initController()).not.toThrow();
  });

  it('should return the right state', () => {
    expect(searchBox.state).toEqual({
      value: state.querySet[id],
      suggestions: state.querySuggest[id]!.completions.map((completion) => ({
        value: completion.expression,
      })),
      redirectTo: '',
      isLoading: false,
      isLoadingSuggestions: false,
      analytics: {
        cause: '',
        metadata: null,
      },
    });
  });

  it('#state.isLoading uses the value in the standalone search-box reducer', () => {
    engine.state.standaloneSearchBoxSet![id] =
      buildMockStandaloneSearchBoxEntry({isLoading: true});
    expect(searchBox.state.isLoading).toBe(true);
  });

  it('#state.redirectTo uses the value in the standalone search-box reducer', () => {
    const redirectTo = '/search-page';
    engine.state.standaloneSearchBoxSet![id] =
      buildMockStandaloneSearchBoxEntry({redirectTo});
    expect(searchBox.state.redirectTo).toBe(redirectTo);
  });

  it('#state.analytics uses the value inside the standalone search-box reducer', () => {
    const metadata = buildMockOmniboxSuggestionMetadata();
    const analytics: StandaloneSearchBoxAnalytics = {
      cause: 'omniboxFromLink',
      metadata,
    };
    engine.state.standaloneSearchBoxSet![id] =
      buildMockStandaloneSearchBoxEntry({analytics});

    expect(searchBox.state.analytics).toEqual(analytics);
  });

  describe('#updateText', () => {
    const query = 'a';

    beforeEach(() => {
      searchBox.updateText(query);
    });

    it('dispatches an action to update analytics to searchFromLink', () => {
      expect(updateAnalyticsToSearchFromLink).toHaveBeenCalledWith({id});
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

    it('dispatchs an action to update analytics to omniboxFromLink', () => {
      searchBox.selectSuggestion('a');
      expect(updateAnalyticsToOmniboxFromLink).toHaveBeenCalledWith(
        expect.objectContaining({
          id,
        })
      );
    });

    it('calls #submit', () => {
      jest.spyOn(searchBox, 'submit');
      searchBox.selectSuggestion('a');

      expect(searchBox.submit).toHaveBeenCalledTimes(1);
    });
  });

  describe('when calling submit', () => {
    it('dispatches updateQuery with the correct parameters', () => {
      const expectedQuery = state.querySet[id];
      searchBox.submit();

      expect(updateQuery).toHaveBeenCalledWith({
        q: expectedQuery,
        enableQuerySyntax: false,
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
