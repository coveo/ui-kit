import {
  ResultsPerPage,
  ResultsPerPageProps,
  buildInsightResultsPerPage,
} from './headless-insight-results-per-page';
import {
  MockInsightEngine,
  buildMockInsightEngine,
} from '../../../test/mock-engine';
import {updateNumberOfResults} from '../../../features/pagination/pagination-actions';
import {insightExecuteSearch} from '../../../features/insight-search/insight-search-actions';

describe('InsightResultsPerPage', () => {
  let engine: MockInsightEngine;
  let props: ResultsPerPageProps;
  let resultsPerPage: ResultsPerPage;

  function initResultsPerPage() {
    resultsPerPage = buildInsightResultsPerPage(engine, props);
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

  it('calling #set executes an insightExecuteSearch', () => {
    resultsPerPage.set(10);

    const action = engine.actions.find(
      (a) => a.type === insightExecuteSearch.pending.type
    );
    expect(action).toBeTruthy();
  });
});
