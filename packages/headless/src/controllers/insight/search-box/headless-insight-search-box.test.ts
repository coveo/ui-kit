import {
  executeSearch,
  fetchQuerySuggestions,
} from '../../../features/insight-search/insight-search-actions.js';
import type {InsightAppState} from '../../../state/insight-app-state.js';
import {
  buildMockInsightEngine,
  type MockedInsightEngine,
} from '../../../test/mock-engine-v2.js';
import {buildMockInsightState} from '../../../test/mock-insight-state.js';
import {buildMockQuerySuggest} from '../../../test/mock-query-suggest.js';
import {
  buildSearchBox,
  type SearchBox,
  type SearchBoxOptions,
  type SearchBoxProps,
} from './headless-insight-search-box.js';

vi.mock('../../../features/query/query-insight-analytics-actions', () => ({
  logSearchboxSubmit: vi.fn(() => () => {}),
}));

vi.mock('../../../features/insight-search/insight-search-actions');

describe('headless searchBox', () => {
  const id = 'search-box-123';
  let state: InsightAppState;

  let engine: MockedInsightEngine;
  let searchBox: SearchBox;
  let props: SearchBoxProps;

  beforeEach(() => {
    vi.resetAllMocks();
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

  function initState() {
    state = buildMockInsightState();
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
    engine = buildMockInsightEngine(state);
    searchBox = buildSearchBox(engine, props);
  }

  describe('#showSuggestions', () => {
    it(`when numberOfQuerySuggestions is greater than 0,
    it does dispatch fetchQuerySuggestions`, async () => {
      searchBox.showSuggestions();

      expect(fetchQuerySuggestions).toHaveBeenCalled();
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
    });
  });
});
