import type {Result} from '../api/search/search/result.js';
import {
  buildSearchEngine,
  type SearchEngine,
} from '../app/search-engine/search-engine.js';
import {
  getSampleSearchEngineConfiguration,
  type SearchEngineConfiguration,
} from '../app/search-engine/search-engine-configuration.js';
import {
  buildCategoryFacet,
  type CategoryFacet,
} from '../controllers/facets/category-facet/headless-category-facet.js';
import {
  buildFacet,
  type Facet,
  type FacetValue,
} from '../controllers/facets/facet/headless-facet.js';
import {
  buildResultList,
  type ResultList,
} from '../controllers/result-list/headless-result-list.js';
import {
  buildSearchBox,
  type SearchBox,
} from '../controllers/search-box/headless-search-box.js';
import {buildSort, type Sort} from '../controllers/sort/headless-sort.js';
import {
  buildDateSortCriterion,
  buildRelevanceSortCriterion,
  SortOrder,
} from '../features/sort-criteria/criteria.js';
import {waitForNextStateChange} from '../test/functional-test-utils.js';

let configuration: SearchEngineConfiguration;
let engine: SearchEngine;
let searchBox: SearchBox;
let resultList: ResultList;
let facet: Facet;
let categoryFacet: CategoryFacet;
let sort: Sort;

beforeAll(() => {
  configuration = getSampleSearchEngineConfiguration();
});

function initEngine() {
  engine = buildSearchEngine({
    configuration,
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

describe('search app', () => {
  beforeAll(async () => {
    initEngine();
    initControllers();

    await waitForNextStateChange(engine, {
      action: () => engine.executeFirstSearch(),
      expectedSubscriberCalls: 2,
    });
  });

  it('displays 10 results in the result list', () => {
    expect(resultList.state.results.length).toBe(10);
  });

  it('displays 8 values in the facet', () => {
    expect(facet.state.values.length).toBe(8);
  });

  it('displays 5 values in the category facet', () => {
    expect(categoryFacet.state.valuesAsTrees.length).toBe(5);
  });

  describe('SearchBox: submit query', () => {
    let initialResults: Result[];
    let initialFacetValues: FacetValue[];

    beforeAll(async () => {
      initialResults = resultList.state.results;
      initialFacetValues = facet.state.values;

      searchBox.updateText('TED');

      await waitForNextStateChange(searchBox, {
        action: () => searchBox.submit(),
        expectedSubscriberCalls: 3,
      });
    });

    afterAll(async () => {
      searchBox.updateText('');

      await waitForNextStateChange(searchBox, {
        action: () => searchBox.submit(),
        expectedSubscriberCalls: 2,
      });
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

      await waitForNextStateChange(resultList, {
        action: () => sort.sortBy(buildDateSortCriterion(SortOrder.Descending)),
        expectedSubscriberCalls: 2,
      });
    });

    afterAll(async () => {
      await waitForNextStateChange(resultList, {
        action: () => sort.sortBy(buildRelevanceSortCriterion()),
        expectedSubscriberCalls: 2,
      });
    });

    it('updates the results', () => {
      expect(resultList.state.results).not.toEqual(initialResults);
    });
  });

  describe('Category Facet: select value', () => {
    let initialFacetValues: FacetValue[];
    let initialResults: Result[];

    beforeAll(async () => {
      initialFacetValues = facet.state.values;
      initialResults = resultList.state.results;

      const [firstFacetValue] = categoryFacet.state.valuesAsTrees;

      await waitForNextStateChange(facet, {
        action: () => categoryFacet.toggleSelect(firstFacetValue),
        expectedSubscriberCalls: 2,
      });
    });

    afterAll(async () => {
      await waitForNextStateChange(facet, {
        action: () => facet.deselectAll(),
        expectedSubscriberCalls: 2,
      });
    });

    it('updates the facet values', () => {
      expect(facet.state.values).not.toEqual(initialFacetValues);
    });

    it('updates the results', () => {
      expect(resultList.state.results).not.toEqual(initialResults);
    });
  });
});

describe('search app with expired token and #renewAccessToken configured to return a valid token', () => {
  const expiredToken =
    /* cspell:disable-next-line */
    'eyJhbGciOiJIUzI1NiJ9.eyJsaWNlbnNlRGVmaW5pdGlvbktleSI6InN0cmluZyIsInY4Ijp0cnVlLCJyb2xlcyI6WyJxdWVyeUV4ZWN1dG9yIl0sInVzZXJEaXNwbGF5TmFtZSI6IkF0b21pYyBDeXByZXNzIEUyRSBUZXN0IiwidXNlcnR5cGUiOiJzdHJpbmciLCJzYWxlc2ZvcmNlQ29tbXVuaXR5Ijoic3RyaW5nIiwiY29tbWVyY2UiOnt9LCJzYWxlc2ZvcmNlVXNlciI6InN0cmluZyIsInBpcGVsaW5lIjoiIiwidXNlckdyb3VwcyI6W10sInNlYXJjaEh1YiI6ImRlZmF1bHQiLCJzYWxlc2ZvcmNlT3JnYW5pemF0aW9uSWQiOiIwMERmMjMwOTAwMThXNWJFQUciLCJjYW5TZWVVc2VyUHJvZmlsZU9mIjpbXSwib3JnYW5pemF0aW9uIjoic2VhcmNodWlzYW1wbGVzIiwidXNlcklkcyI6W3siYXV0aENvb2tpZSI6IiIsInByb3ZpZGVyIjoiRW1haWwgU2VjdXJpdHkgUHJvdmlkZXIiLCJuYW1lIjoiY3lwcmVzc0B0ZXN0LmNvbSIsInR5cGUiOiJVc2VyIiwiaW5mb3MiOnt9fV0sImV4cCI6MTYyMjIyODY4OSwiaWF0IjoxNjIyMjI3Nzg5LCJzYWxlc2ZvcmNlRmFsbGJhY2tUb0FkbWluIjp0cnVlfQ.X4GQe8T0uwZi1WnHIyEvdT_HpgwqFX6kaua8jIZcxAw';
  const validToken = getSampleSearchEngineConfiguration().accessToken;

  beforeAll(async () => {
    configuration.accessToken = expiredToken;
    configuration.renewAccessToken = () => Promise.resolve(validToken);

    initEngine();
    initControllers();

    await waitForNextStateChange(engine, {
      action: () => engine.executeFirstSearch(),
      expectedSubscriberCalls: 5,
    });
  });

  it('sets the valid token in state', () => {
    expect(engine.state.configuration.accessToken).toBe(validToken);
  });

  it('displays 10 results in the result list', () => {
    vi.waitFor(() => expect(resultList.state.results.length).toBe(10));
  });
});
