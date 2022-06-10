import {
  InsightSearchBox,
  InsightSearchBoxProps,
  SearchBoxOptions,
  buildInsightSearchBox,
} from './headless-insight-search-box';
import {fetchQuerySuggestions} from '../../../features/query-suggest/query-suggest-actions';
import {executeSearch} from '../../../features/insight-search/insight-search-actions';
import {buildMockQuerySuggest} from '../../../test/mock-query-suggest';
import {
  buildMockInsightEngine,
  MockInsightEngine,
} from '../../../test/mock-engine';
import {InsightAppState} from '../../../state/insight-app-state';
import {buildMockInsightState} from '../../../test/mock-insight-state';

describe('headless searchBox', () => {
  const id = 'search-box-123';
  let state: InsightAppState;

  let engine: MockInsightEngine;
  let searchBox: InsightSearchBox;
  let props: InsightSearchBoxProps;

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

  function initState() {
    state = buildMockInsightState();
    state.querySet[id] = 'query';
    state.querySuggest[id] = buildMockQuerySuggest({
      id,
      q: 'some value',
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
    engine = buildMockInsightEngine({state});
    searchBox = buildInsightSearchBox(engine, props);
  }

  describe('#showSuggestions', () => {
    it(`when numberOfQuerySuggestions is greater than 0,
    it does not dispatch fetchQuerySuggestions`, async () => {
      searchBox.showSuggestions();

      const hasAction = engine.actions.some(
        (a) => a.type === fetchQuerySuggestions.pending.type
      );

      expect(hasAction).toBe(false);
    });

    it(`when numberOfQuerySuggestions is 0,
      it does not dispatch fetchQuerySuggestions`, () => {
      props.options!.numberOfSuggestions = 0;
      initController();

      searchBox.showSuggestions();

      const hasAction = engine.actions.some(
        (a) => a.type === fetchQuerySuggestions.pending.type
      );

      expect(hasAction).toBe(false);
    });
  });

  describe('#selectSuggestion', () => {
    it('dispatches executeSearch', () => {
      const suggestion = 'a';
      searchBox.selectSuggestion(suggestion);

      expect(engine.findAsyncAction(executeSearch.pending)).toBeTruthy();
    });
  });

  describe('when calling submit', () => {
    it('it dispatches an executeSearch action', () => {
      searchBox.submit();

      const action = engine.actions.find(
        (a) => a.type === executeSearch.pending.type
      );
      expect(action).toBeTruthy();
    });
  });
});
