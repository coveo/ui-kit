import {executeSearch} from '../../../features/insight-search/insight-search-actions';
import {updateNumberOfResults} from '../../../features/pagination/pagination-actions';
import {
  MockInsightEngine,
  buildMockInsightEngine,
} from '../../../test/mock-engine';
import {
  ResultsPerPage,
  ResultsPerPageProps,
  buildResultsPerPage,
} from './headless-insight-results-per-page';

describe('InsightResultsPerPage', () => {
  let engine: MockInsightEngine;
  let props: ResultsPerPageProps;
  let resultsPerPage: ResultsPerPage;

  function initResultsPerPage() {
    resultsPerPage = buildResultsPerPage(engine, props);
  }

  beforeEach(() => {
    engine = buildMockInsightEngine({});
    props = {
      initialState: {},
    };

    initResultsPerPage();
  });

  it('calling #set updates the number of results to the passed value', () => {
    const num = 10;
    resultsPerPage.set(num);

    expect(engine.actions).toContainEqual(updateNumberOfResults(num));
  });

  it('calling #set executes an executeSearch', () => {
    resultsPerPage.set(10);

    const action = engine.actions.find(
      (a) => a.type === executeSearch.pending.type
    );
    expect(action).toBeTruthy();
  });
});
