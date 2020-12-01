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

const engine = new HeadlessEngine({
  configuration: HeadlessEngine.getSampleConfiguration(),
  reducers: searchAppReducers,
  loggerOptions: {level: 'silent'},
});

const searchBox = buildSearchBox(engine);
const resultList = buildResultList(engine);
const facet = buildFacet(engine, {options: {field: 'author'}});
const categoryFacet = buildCategoryFacet(engine, {
  options: {field: 'geographicalhierarchy'},
});
const sort = buildSort(engine);

describe('search app', () => {
  beforeAll(async () => {
    const analytics = AnalyticsActions.logInterfaceLoad();
    const action = SearchActions.executeSearch(analytics);
    engine.dispatch(action);

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
