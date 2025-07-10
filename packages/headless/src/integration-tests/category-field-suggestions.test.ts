import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
  type SearchEngine,
} from '../app/search-engine/search-engine.js';
import {
  buildCategoryFacet,
  type CategoryFacet,
} from '../controllers/facets/category-facet/headless-category-facet.js';
import {
  buildFacet,
  type Facet,
} from '../controllers/facets/facet/headless-facet.js';
import {
  buildCategoryFieldSuggestions,
  type CategoryFieldSuggestions,
} from '../controllers/field-suggestions/category-facet/headless-category-field-suggestions.js';
import {waitForNextStateChange} from '../test/functional-test-utils.js';

describe('category field suggestions', () => {
  let engine: SearchEngine;
  const field = 'geographicalhierarchy';
  const unrelatedFacetField = 'author';
  beforeEach(() => {
    engine = buildSearchEngine({
      configuration: {
        ...getSampleSearchEngineConfiguration(),
        analytics: {enabled: false},
      },
      loggerOptions: {level: 'silent'},
    });
  });

  describe('with a matching category facet', () => {
    let categoryFacet: CategoryFacet;
    let categoryFieldSuggestions: CategoryFieldSuggestions;

    function getSelectedValue() {
      return categoryFacet.state.selectedValueAncestry.slice(-1)[0];
    }

    beforeEach(async () => {
      await waitForNextStateChange(engine, {
        action: () => {
          categoryFacet = buildCategoryFacet(engine, {options: {field}});
        },
        expectedSubscriberCalls: 5,
      });
      await waitForNextStateChange(engine, {
        action: () => {
          categoryFieldSuggestions = buildCategoryFieldSuggestions(engine, {
            options: {
              facet: {
                field,
                facetId: categoryFacet.state.facetId,
              },
            },
          });
        },
        expectedSubscriberCalls: 2,
      });
    });

    describe('after calling #search', () => {
      beforeEach(async () => {
        await waitForNextStateChange(categoryFieldSuggestions, {
          action: () => categoryFieldSuggestions.search(),
          expectedSubscriberCalls: 2,
        });
      });

      it('can select category facet values', async () => {
        const firstToggledValue = categoryFieldSuggestions.state.values[0];
        const secondToggledValue = categoryFieldSuggestions.state.values[1];
        await waitForNextStateChange(categoryFacet, {
          action: () => categoryFieldSuggestions.select(firstToggledValue),
          expectedSubscriberCalls: 2,
        });
        expect(getSelectedValue().value).toEqual(firstToggledValue.rawValue);
        await waitForNextStateChange(categoryFacet, {
          action: () => categoryFieldSuggestions.select(secondToggledValue),
          expectedSubscriberCalls: 2,
        });
        expect(getSelectedValue().value).toEqual(secondToggledValue.rawValue);
      });
    });
  });

  describe('initialized without a category facet', () => {
    let categoryFieldSuggestions: CategoryFieldSuggestions;
    beforeEach(async () => {
      await waitForNextStateChange(engine, {
        action: () => {
          categoryFieldSuggestions = buildCategoryFieldSuggestions(engine, {
            options: {facet: {field}},
          });
        },
        expectedSubscriberCalls: 3,
      });
    });

    it('has the correct initial state', () => {
      expect(categoryFieldSuggestions.state).toEqual({
        isLoading: false,
        values: [],
        query: '',
        moreValuesAvailable: false,
      });
    });

    describe('after calling #search', () => {
      beforeEach(async () => {
        await waitForNextStateChange(categoryFieldSuggestions, {
          action: () => categoryFieldSuggestions.search(),
          expectedSubscriberCalls: 2,
        });
      });

      afterEach(() => {
        vi.clearAllMocks();
      });

      it('has more values', () => {
        expect(categoryFieldSuggestions.state.values.length).toBeGreaterThan(0);
      });

      it('can fetch more values', async () => {
        expect(categoryFieldSuggestions.state.moreValuesAvailable).toBeTruthy();
        const numberOfValues = categoryFieldSuggestions.state.values.length;
        await waitForNextStateChange(categoryFieldSuggestions, {
          action: () => categoryFieldSuggestions.showMoreResults(),
          expectedSubscriberCalls: 2,
        });
        expect(categoryFieldSuggestions.state.values.length).toBeGreaterThan(
          numberOfValues
        );
      });
    });

    it('is unaffected by the current search context', async () => {
      let facet!: Facet;
      await waitForNextStateChange(engine, {
        action: () => {
          facet = buildFacet(engine, {
            options: {field: unrelatedFacetField},
          });
        },
        expectedSubscriberCalls: 3,
      });
      await waitForNextStateChange(facet, {
        action: () => engine.executeFirstSearch(),
        expectedSubscriberCalls: 2,
      });
      await waitForNextStateChange(categoryFieldSuggestions, {
        action: () => categoryFieldSuggestions.search(),
        expectedSubscriberCalls: 2,
      });
      const initialSuggestions = categoryFieldSuggestions.state.values;
      await waitForNextStateChange(facet, {
        action: () => facet.toggleSelect(facet.state.values[0]),
        expectedSubscriberCalls: 2,
      });
      await waitForNextStateChange(categoryFieldSuggestions, {
        action: () => categoryFieldSuggestions.search(),
        expectedSubscriberCalls: 2,
      });
      expect(categoryFieldSuggestions.state.values).toEqual(initialSuggestions);
    });

    it('set isLoading when calling #search', async () => {
      await waitForNextStateChange(categoryFieldSuggestions, {
        action: () => categoryFieldSuggestions.search(),
      });
      expect(categoryFieldSuggestions.state.isLoading).toBeTruthy();
      await waitForNextStateChange(categoryFieldSuggestions);
      expect(categoryFieldSuggestions.state.isLoading).toBeFalsy();
    });

    it('can search with a query', async () => {
      const query = 'king';
      await waitForNextStateChange(categoryFieldSuggestions, {
        action: () => categoryFieldSuggestions.updateText(query),
        expectedSubscriberCalls: 3,
      });
      expect(categoryFieldSuggestions.state.query).toEqual(query);
      expect(categoryFieldSuggestions.state.values.length).toBeGreaterThan(0);
      const valuesThatDoNotContainQuery =
        categoryFieldSuggestions.state.values.filter(
          (value) => !value.displayValue.toLowerCase().includes(query)
        );
      expect(valuesThatDoNotContainQuery.length).toEqual(0);
    });

    it('can update captions', async () => {
      const rawValue = 'United Kingdom';
      const displayValue = 'Britain';
      const query = 'king';
      categoryFieldSuggestions.updateCaptions({
        [rawValue]: displayValue,
      });
      await waitForNextStateChange(categoryFieldSuggestions, {
        action: () => categoryFieldSuggestions.updateText(query),
        expectedSubscriberCalls: 3,
      });
      expect(
        categoryFieldSuggestions.state.values.find(
          (value) => value.rawValue === rawValue
        )?.displayValue
      ).toEqual(displayValue);
    });

    it('can clear the search', async () => {
      const query = 'doc';
      await waitForNextStateChange(categoryFieldSuggestions, {
        action: () => categoryFieldSuggestions.updateText(query),
        expectedSubscriberCalls: 3,
      });
      await waitForNextStateChange(categoryFieldSuggestions, {
        action: () => categoryFieldSuggestions.clear(),
      });
      expect(categoryFieldSuggestions.state.query).toEqual('');
      expect(categoryFieldSuggestions.state.values.length).toEqual(0);
    });
  });

  it('can filter by base path', async () => {
    const basePath: string[] = ['North America'];
    /* cspell:disable-next-line */
    const query = 'queb';
    const expectedResult = 'Quebec';
    const expectedPath = ['Canada'];
    let categoryFieldSuggestions!: CategoryFieldSuggestions;
    await waitForNextStateChange(engine, {
      action: () => {
        categoryFieldSuggestions = buildCategoryFieldSuggestions(engine, {
          options: {facet: {field, basePath}},
        });
      },
      expectedSubscriberCalls: 3,
    });
    await waitForNextStateChange(categoryFieldSuggestions, {
      action: () => categoryFieldSuggestions.updateText(query),
      expectedSubscriberCalls: 3,
    });
    const queriedResult = categoryFieldSuggestions.state.values.find(
      (value) => value.rawValue === expectedResult
    );
    expect(queriedResult?.path).toEqual(expectedPath);
  });
});
