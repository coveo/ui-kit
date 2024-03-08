import {executeSearch} from '../../../features/insight-search/insight-search-actions';
import {updateNumberOfResults} from '../../../features/pagination/pagination-actions';
import {
  MockedInsightEngine,
  buildMockInsightEngine,
} from '../../../test/mock-engine-v2';
import {buildMockInsightState} from '../../../test/mock-insight-state';
import {
  ResultsPerPage,
  ResultsPerPageProps,
  buildResultsPerPage,
} from './headless-insight-results-per-page';

jest.mock('../../../features/pagination/pagination-actions');
jest.mock('../../../features/insight-search/insight-search-actions');

describe('InsightResultsPerPage', () => {
  let engine: MockedInsightEngine;
  let props: ResultsPerPageProps;
  let resultsPerPage: ResultsPerPage;

  function initResultsPerPage() {
    resultsPerPage = buildResultsPerPage(engine, props);
  }

  beforeEach(() => {
    engine = buildMockInsightEngine(buildMockInsightState());
    props = {
      initialState: {},
    };

    initResultsPerPage();
  });

  it('calling #set updates the number of results to the passed value', () => {
    const num = 10;
    resultsPerPage.set(num);
    expect(updateNumberOfResults).toHaveBeenCalledWith(num);
  });

  it('calling #set executes an executeSearch', () => {
    resultsPerPage.set(10);
    expect(executeSearch).toHaveBeenCalled();
  });
});
