import {fetchQuerySuggestions} from '../../features/query-suggest/query-suggest-actions';
import {logSearchboxSubmit} from '../../features/query/query-analytics-actions';
import {executeSearch} from '../../features/search/search-actions';
import {SearchAppState} from '../../state/search-app-state';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../test/mock-engine-v2';
import {buildMockQuerySuggest} from '../../test/mock-query-suggest';
import {createMockState} from '../../test/mock-state';
import {
  SearchBox,
  SearchBoxProps,
  SearchBoxOptions,
  buildSearchBox,
} from './headless-search-box';

jest.mock('../../features/query/query-analytics-actions', () => ({
  logSearchboxSubmit: jest.fn(() => () => {}),
  searchboxSubmit: jest.fn(() => () => {}),
}));

jest.mock('../../features/search/search-actions');
jest.mock('../../features/query-suggest/query-suggest-actions');

describe('headless searchBox', () => {
  const id = 'search-box-123';
  let state: SearchAppState;

  let engine: MockedSearchEngine;
  let searchBox: SearchBox;
  let props: SearchBoxProps;

  beforeEach(() => {
    const options: SearchBoxOptions = {
      id,
      numberOfSuggestions: 10,
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

    props = {options};

    initState();
    initController();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function initState() {
    state = createMockState();
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
    engine = buildMockSearchEngine(state);
    searchBox = buildSearchBox(engine, props);
  }

  describe('#showSuggestions', () => {
    it(`when numberOfQuerySuggestions is greater than 0,
    it dispatches fetchQuerySuggestions`, async () => {
      searchBox.showSuggestions();
      expect(fetchQuerySuggestions).toHaveBeenCalledWith({id});
    });

    it(`when numberOfQuerySuggestions is 0,
    it does not dispatch fetchQuerySuggestions`, () => {
      props.options!.numberOfSuggestions = 0;
      initController();

      searchBox.showSuggestions();
      expect(fetchQuerySuggestions).not.toHaveBeenCalled();
    });
  });

  describe('#selectSuggestion', () => {
    it('dispatches executeSearch', () => {
      const suggestion = 'a';
      searchBox.selectSuggestion(suggestion);
      expect(executeSearch).toHaveBeenCalled();
    });
  });

  describe('when calling submit', () => {
    it('it dispatches an executeSearch action', () => {
      searchBox.submit();
      expect(executeSearch).toHaveBeenCalled();
      expect(logSearchboxSubmit).toHaveBeenCalled();
    });
  });
});
