import {
  buildStandaloneSearchBox,
  StandaloneSearchBox,
  StandaloneSearchBoxOptions,
} from './headless-standalone-search-box';
import {createMockState} from '../../test/mock-state';
import {updateQuery} from '../../features/query/query-actions';
import {buildMockQuerySuggest} from '../../test/mock-query-suggest';
import {
  buildMockSearchAppEngine,
  MockSearchEngine,
} from '../../test/mock-engine';
import {SearchAppState} from '../../state/search-app-state';
import {
  registerQuerySetQuery,
  updateQuerySetQuery,
} from '../../features/query-set/query-set-actions';
import {selectQuerySuggestion} from '../../features/query-suggest/query-suggest-actions';
import {
  configuration,
  query,
  standaloneSearchBoxSet,
  querySuggest,
  redirection,
} from '../../app/reducers';
import {
  fetchRedirectUrl,
  registerStandaloneSearchBox,
  updateAnalyticsToOmniboxFromLink,
  updateAnalyticsToSearchFromLink,
} from '../../features/standalone-search-box-set/standalone-search-box-set-actions';
import {buildMockStandaloneSearchBoxEntry} from '../../test/mock-standalone-search-box-entry';
import {buildMockOmniboxSuggestionMetadata} from '../../test/mock-omnibox-suggestion-metadata';
import {StandaloneSearchBoxAnalytics} from '../../features/standalone-search-box-set/standalone-search-box-set-state';
import {OmniboxSuggestionMetadata} from '../../features/query-suggest/query-suggest-analytics-actions';

describe('headless standalone searchBox', () => {
  const id = 'search-box-123';
  let state: SearchAppState;

  let engine: MockSearchEngine;
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
    state.querySuggest[id] = buildMockQuerySuggest({id, q: 'some value'});
    state.standaloneSearchBoxSet[id] = buildMockStandaloneSearchBoxEntry();
  }

  function initController() {
    engine = buildMockSearchAppEngine({state});
    searchBox = buildStandaloneSearchBox(engine, {options});
  }

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      standaloneSearchBoxSet,
      configuration,
      query,
      querySuggest,
      redirection,
    });
  });

  it('dispatches #registerStandaloneSearchBox with the correct options', () => {
    const action = registerStandaloneSearchBox({
      id,
      redirectionUrl: options.redirectionUrl,
    });
    expect(engine.actions).toContainEqual(action);
  });

  it('when no id is passed, it creates an id prefixed with standalone_search_box', () => {
    options = {redirectionUrl: 'https://www.coveo.com/en/search'};
    initController();

    const action = engine.actions.find(
      (a) => a.type === registerQuerySetQuery.type
    );

    const payload = expect.objectContaining({
      id: expect.stringContaining('standalone_search_box'),
    });

    expect(action).toEqual(expect.objectContaining({payload}));
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
    engine.state.standaloneSearchBoxSet[id] = buildMockStandaloneSearchBoxEntry(
      {isLoading: true}
    );
    expect(searchBox.state.isLoading).toBe(true);
  });

  it('#state.redirectTo uses the value in the standalone search-box reducer', () => {
    const redirectTo = '/search-page';
    engine.state.standaloneSearchBoxSet[id] = buildMockStandaloneSearchBoxEntry(
      {redirectTo}
    );
    expect(searchBox.state.redirectTo).toBe(redirectTo);
  });

  it('#state.analytics uses the value inside the standalone search-box reducer', () => {
    const metadata = buildMockOmniboxSuggestionMetadata();
    const analytics: StandaloneSearchBoxAnalytics = {
      cause: 'omniboxFromLink',
      metadata,
    };
    engine.state.standaloneSearchBoxSet[id] = buildMockStandaloneSearchBoxEntry(
      {analytics}
    );

    expect(searchBox.state.analytics).toEqual(analytics);
  });

  describe('#updateText', () => {
    const query = 'a';

    beforeEach(() => {
      searchBox.updateText(query);
    });

    it('dispatches an action to update analytics to searchFromLink', () => {
      const action = updateAnalyticsToSearchFromLink({id});
      expect(engine.actions).toContainEqual(action);
    });

    it('dispatches #updateQuerySetQuery', () => {
      const action = updateQuerySetQuery({id, query});
      expect(engine.actions).toContainEqual(action);
    });
  });

  describe('#selectSuggestion', () => {
    it('updates the query', () => {
      const expression = 'a';
      searchBox.selectSuggestion(expression);

      expect(engine.actions).toContainEqual(
        selectQuerySuggestion({id, expression})
      );
    });

    it('dispatchs an action to update analytics to omniboxFromLink', () => {
      const metadata: OmniboxSuggestionMetadata = {
        partialQueries: [],
        partialQuery: '',
        suggestionRanking: -1,
        suggestions: [],
        querySuggestResponseId: '',
      };

      const action = updateAnalyticsToOmniboxFromLink({id, metadata});

      searchBox.selectSuggestion('a');
      expect(engine.actions).toContainEqual(action);
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

      expect(engine.actions).toContainEqual(
        updateQuery({q: expectedQuery, enableQuerySyntax: false})
      );
    });

    it('should dispatch a fetchRedirectUrl action', () => {
      searchBox.submit();

      const action = engine.actions.find(
        (a) => a.type === fetchRedirectUrl.pending.type
      );
      expect(action).toBeTruthy();
    });
  });
});
