import {
  CategoryFacet,
  Facet,
  ResultList,
  SearchBox,
  Sort,
} from '../controllers';
import {
  buildDateSortCriterion,
  buildRelevanceSortCriterion,
  SortOrder,
} from '../features/sort-criteria/criteria';
import {
  HeadlessEngine,
  searchAppReducers,
  buildSearchBox,
  buildResultList,
  buildFacet,
  buildSort,
  buildCategoryFacet,
  SearchActions,
  AnalyticsActions,
  Result,
  CategoryFacetValue,
  FacetValue,
} from '../index';

const sleep = (seconds: number) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

const configuration = HeadlessEngine.getSampleConfiguration();
let engine: HeadlessEngine<{}>;
let searchBox: SearchBox;
let resultList: ResultList;
let facet: Facet;
let categoryFacet: CategoryFacet;
let sort: Sort;

function initEngine() {
  engine = new HeadlessEngine({
    configuration,
    reducers: searchAppReducers,
    loggerOptions: {level: 'silent'},
  });
}

function initControllers() {
  searchBox = buildSearchBox(engine);
  resultList = buildResultList(engine);
  facet = buildFacet(engine, {options: {field: 'author'}});
  categoryFacet = buildCategoryFacet(engine, {
    options: {field: 'geographicalhierarchy'},
  });
  sort = buildSort(engine);
}

function executeFirstSearch() {
  const analytics = AnalyticsActions.logInterfaceLoad();
  const action = SearchActions.executeSearch(analytics);
  engine.dispatch(action);
}

describe('search app', () => {
  beforeAll(async () => {
    initEngine();
    initControllers();
    executeFirstSearch();

    await sleep(2);
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

      await sleep(2);
    });

    afterAll(async () => {
      searchBox.updateText('');
      searchBox.submit();

      await sleep(2);
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

      await sleep(2);
    });

    afterAll(async () => {
      sort.sortBy(buildRelevanceSortCriterion());
      await sleep(2);
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

      await sleep(2);
    });

    afterAll(async () => {
      facet.deselectAll();
      await sleep(2);
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
});

describe('search app with expired token and #renewAccessToken configured to return a valid token', () => {
  const validToken = HeadlessEngine.getSampleConfiguration().accessToken;

  beforeAll(async () => {
    configuration.accessToken =
      'eyJhbGciOiJIUzI1NiJ9.eyJsaWNlbnNlRGVmaW5pdGlvbktleSI6InN0cmluZyIsInY4Ijp0cnVlLCJyb2xlcyI6WyJxdWVyeUV4ZWN1dG9yIl0sInVzZXJEaXNwbGF5TmFtZSI6IkF0b21pYyBDeXByZXNzIEUyRSBUZXN0IiwidXNlcnR5cGUiOiJzdHJpbmciLCJzYWxlc2ZvcmNlQ29tbXVuaXR5Ijoic3RyaW5nIiwiY29tbWVyY2UiOnt9LCJzYWxlc2ZvcmNlVXNlciI6InN0cmluZyIsInBpcGVsaW5lIjoiIiwidXNlckdyb3VwcyI6W10sInNlYXJjaEh1YiI6ImRlZmF1bHQiLCJzYWxlc2ZvcmNlT3JnYW5pemF0aW9uSWQiOiIwMERmMjMwOTAwMThXNWJFQUciLCJjYW5TZWVVc2VyUHJvZmlsZU9mIjpbXSwib3JnYW5pemF0aW9uIjoic2VhcmNodWlzYW1wbGVzIiwidXNlcklkcyI6W3siYXV0aENvb2tpZSI6IiIsInByb3ZpZGVyIjoiRW1haWwgU2VjdXJpdHkgUHJvdmlkZXIiLCJuYW1lIjoiY3lwcmVzc0B0ZXN0LmNvbSIsInR5cGUiOiJVc2VyIiwiaW5mb3MiOnt9fV0sImV4cCI6MTYyMjIyODY4OSwiaWF0IjoxNjIyMjI3Nzg5LCJzYWxlc2ZvcmNlRmFsbGJhY2tUb0FkbWluIjp0cnVlfQ.X4GQe8T0uwZi1WnHIyEvdT_HpgwqFX6kaua8jIZcxAw';
    configuration.renewAccessToken = () => Promise.resolve(validToken);

    initEngine();
    initControllers();
    executeFirstSearch();

    await sleep(2);
  });

  it('sets the valid token in state', () => {
    expect(engine.state.configuration.accessToken).toBe(validToken);
  });

  it('displays 10 results in the result list', () => {
    expect(resultList.state.results.length).toBe(10);
  });
});
