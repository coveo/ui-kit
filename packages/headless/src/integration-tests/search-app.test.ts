jest.mock('coveo.analytics');
import {CoveoSearchPageClient} from 'coveo.analytics';
import {PartialDocumentInformation} from 'coveo.analytics/dist/definitions/searchPage/searchPageEvents';
import {
  SearchEngine,
  buildSearchEngine,
} from '../app/search-engine/search-engine';
import {getSampleSearchEngineConfiguration} from '../app/search-engine/search-engine-configuration';
import {
  buildPager,
  CategoryFacet,
  Facet,
  Pager,
  ResultList,
  SearchBox,
  Sort,
} from '../controllers';
import {logClickEvent} from '../features/analytics/analytics-actions';
import {
  buildDateSortCriterion,
  buildRelevanceSortCriterion,
  SortOrder,
} from '../features/sort-criteria/criteria';
import {
  buildSearchBox,
  buildResultList,
  buildFacet,
  buildSort,
  buildCategoryFacet,
  Result,
  CategoryFacetValue,
  FacetValue,
} from '../index';

const configuration = getSampleSearchEngineConfiguration();
let engine: SearchEngine;
let searchBox: SearchBox;
let resultList: ResultList;
let pager: Pager;
let facet: Facet;
let categoryFacet: CategoryFacet;
let sort: Sort;

function initEngine() {
  engine = buildSearchEngine({
    configuration: getSampleSearchEngineConfiguration(),
    loggerOptions: {level: 'silent'},
  });
}

function initControllers() {
  searchBox = buildSearchBox(engine);
  resultList = buildResultList(engine);
  pager = buildPager(engine);
  facet = buildFacet(engine, {options: {field: 'author'}});
  categoryFacet = buildCategoryFacet(engine, {
    options: {field: 'geographicalhierarchy'},
  });
  sort = buildSort(engine);
}

function waitForChange<S, V extends number | string>(
  controller: {state: S; subscribe: (listener: () => void) => () => void},
  getValue: (state: S) => V
): Promise<void> {
  const oldValue = getValue(controller.state);
  return new Promise((resolve) => {
    const unsubscribe = controller.subscribe(() => {
      const newValue = getValue(controller.state);
      if (oldValue !== newValue) {
        unsubscribe();
        resolve();
      }
    });
  });
}

const waitForNewResults = () =>
  waitForChange(resultList, ({searchUid}) => searchUid);

function getLatestAnalyticsClient() {
  const clients = (CoveoSearchPageClient as jest.MockedClass<
    typeof CoveoSearchPageClient
  >).mock.instances;
  return clients[clients.length - 1] as jest.Mocked<CoveoSearchPageClient>;
}

function getLatestPartialDocumentInformation() {
  const client = getLatestAnalyticsClient();
  const logClickEventSpy = client.logClickEvent as jest.MockedFunction<
    typeof client.logClickEvent
  >;
  return logClickEventSpy.mock.calls[
    logClickEventSpy.mock.calls.length - 1
  ][1] as PartialDocumentInformation;
}

function clickLastResult() {
  const result = resultList.state.results[resultList.state.results.length - 1];
  engine.dispatch(logClickEvent({evt: 'documentOpen', result}));
}

describe('search app', () => {
  beforeAll(async () => {
    initEngine();
    initControllers();

    engine.executeFirstSearch();
    await waitForNewResults();
  });

  it('displays 10 results in the result list', () => {
    expect(resultList.state.results.length).toBe(10);
  });

  it('displays 8 values in the facet', () => {
    expect(facet.state.values.length).toBe(8);
  });

  it('displays 5 values in the category facet', () => {
    expect(categoryFacet.state.values.length).toBe(5);
  });

  describe('SearchBox: submit query', () => {
    let initialResults: Result[];
    let initialFacetValues: FacetValue[];

    beforeAll(async () => {
      initialResults = resultList.state.results;
      initialFacetValues = facet.state.values;

      searchBox.updateText('TED');
      searchBox.submit();

      await waitForNewResults();
    });

    afterAll(async () => {
      searchBox.updateText('');
      searchBox.submit();

      await waitForNewResults();
    });

    it('updates the result list', () => {
      expect(resultList.state.results).not.toEqual(initialResults);
    });

    it('updates the facet values', () => {
      expect(facet.state.values).not.toEqual(initialFacetValues);
    });
  });

  describe('Sort: change order', () => {
    let initialResults: Result[];

    beforeAll(async () => {
      initialResults = resultList.state.results;
      sort.sortBy(buildDateSortCriterion(SortOrder.Descending));

      await waitForNewResults();
    });

    afterAll(async () => {
      sort.sortBy(buildRelevanceSortCriterion());
      await waitForNewResults();
    });

    it('updates the results', () => {
      expect(resultList.state.results).not.toEqual(initialResults);
    });
  });

  describe('Facet: select value', () => {
    let initialCategoryFacetValues: CategoryFacetValue[];
    let initialResults: Result[];

    beforeAll(async () => {
      initialCategoryFacetValues = categoryFacet.state.values;
      initialResults = resultList.state.results;

      const [firstFacetValue] = facet.state.values;
      facet.toggleSelect(firstFacetValue);

      await waitForNewResults();
    });

    afterAll(async () => {
      facet.deselectAll();
      await waitForNewResults();
    });

    it('updates the category facet values', () => {
      expect(categoryFacet.state.values).not.toEqual(
        initialCategoryFacetValues
      );
    });

    it('updates the results', () => {
      expect(resultList.state.results).not.toEqual(initialResults);
    });
  });

  it('sends the correct documentPosition', async (done) => {
    clickLastResult();
    expect(getLatestPartialDocumentInformation().documentPosition).toEqual(10);

    pager.nextPage();
    await waitForNewResults();
    clickLastResult();
    expect(getLatestPartialDocumentInformation().documentPosition).toEqual(20);

    resultList.fetchMoreResults();
    await waitForNewResults();
    clickLastResult();
    expect(getLatestPartialDocumentInformation().documentPosition).toEqual(30);

    done();
  });
});

describe('search app with expired token and #renewAccessToken configured to return a valid token', () => {
  const expiredToken =
    'eyJhbGciOiJIUzI1NiJ9.eyJsaWNlbnNlRGVmaW5pdGlvbktleSI6InN0cmluZyIsInY4Ijp0cnVlLCJyb2xlcyI6WyJxdWVyeUV4ZWN1dG9yIl0sInVzZXJEaXNwbGF5TmFtZSI6IkF0b21pYyBDeXByZXNzIEUyRSBUZXN0IiwidXNlcnR5cGUiOiJzdHJpbmciLCJzYWxlc2ZvcmNlQ29tbXVuaXR5Ijoic3RyaW5nIiwiY29tbWVyY2UiOnt9LCJzYWxlc2ZvcmNlVXNlciI6InN0cmluZyIsInBpcGVsaW5lIjoiIiwidXNlckdyb3VwcyI6W10sInNlYXJjaEh1YiI6ImRlZmF1bHQiLCJzYWxlc2ZvcmNlT3JnYW5pemF0aW9uSWQiOiIwMERmMjMwOTAwMThXNWJFQUciLCJjYW5TZWVVc2VyUHJvZmlsZU9mIjpbXSwib3JnYW5pemF0aW9uIjoic2VhcmNodWlzYW1wbGVzIiwidXNlcklkcyI6W3siYXV0aENvb2tpZSI6IiIsInByb3ZpZGVyIjoiRW1haWwgU2VjdXJpdHkgUHJvdmlkZXIiLCJuYW1lIjoiY3lwcmVzc0B0ZXN0LmNvbSIsInR5cGUiOiJVc2VyIiwiaW5mb3MiOnt9fV0sImV4cCI6MTYyMjIyODY4OSwiaWF0IjoxNjIyMjI3Nzg5LCJzYWxlc2ZvcmNlRmFsbGJhY2tUb0FkbWluIjp0cnVlfQ.X4GQe8T0uwZi1WnHIyEvdT_HpgwqFX6kaua8jIZcxAw';
  const validToken = getSampleSearchEngineConfiguration().accessToken;

  beforeAll(async () => {
    configuration.accessToken = expiredToken;
    configuration.renewAccessToken = () => Promise.resolve(validToken);

    initEngine();
    initControllers();

    engine.executeFirstSearch();
    await waitForNewResults();
  });

  it('sets the valid token in state', () => {
    expect(engine.state.configuration.accessToken).toBe(validToken);
  });

  it('displays 10 results in the result list', () => {
    expect(resultList.state.results.length).toBe(10);
  });
});
