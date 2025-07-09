import {
  buildCommerceEngine,
  type CommerceEngine,
  type CommerceEngineConfiguration,
} from '../app/commerce-engine/commerce-engine.js';
import {getSampleCommerceEngineConfiguration} from '../app/commerce-engine/commerce-engine-configuration.js';
import type {CategoryFieldSuggestions} from '../controllers/commerce/field-suggestions/headless-category-field-suggestions.js';
import {buildFieldSuggestionsGenerator} from '../controllers/commerce/field-suggestions/headless-field-suggestions-generator.js';
import {
  buildProductListing,
  type ProductListing,
} from '../controllers/commerce/product-listing/headless-product-listing.js';
import {buildRecommendations} from '../controllers/commerce/recommendations/headless-recommendations.js';
import {buildSearch} from '../controllers/commerce/search/headless-search.js';
import {
  buildSearchBox,
  type SearchBox,
} from '../controllers/commerce/search-box/headless-search-box.js';
import {waitForNextStateChange} from '../test/functional-test-utils.js';

describe.skip('commerce', () => {
  let configuration: CommerceEngineConfiguration;
  let engine: CommerceEngine;

  beforeAll(async () => {
    configuration = getSampleCommerceEngineConfiguration();
    engine = buildCommerceEngine({
      configuration: {
        ...configuration,
        analytics: {
          ...configuration.analytics,
          enabled: false,
        },
      },
    });
  });

  describe('product listing', () => {
    let productListing: ProductListing;

    const fetchProductListing = async () => {
      await waitForNextStateChange(productListing, {
        action: () => productListing.refresh(),
        expectedSubscriberCalls: 2,
      });
    };

    beforeAll(async () => {
      productListing = buildProductListing(engine);
      await fetchProductListing();
    });

    it('uses the context to fetch the product listing', async () => {
      expect(productListing.state.products).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            ec_name: 'Lime Surfboard',
          }),
          expect.objectContaining({
            ec_name: 'Sunnysurf Surfboard',
          }),
          expect.objectContaining({
            ec_name: 'Eco-Surf',
          }),
        ])
      );
    });

    it('applies sort to product listing', async () => {
      const sort = productListing.sort();
      const differentSort = sort.state.availableSorts.find(
        (availableSort) => !sort.isSortedBy(availableSort)
      )!;

      await waitForNextStateChange(sort, {
        action: () => sort.sortBy(differentSort),
      });

      expect(sort.isSortedBy(differentSort)).toBeTruthy();
      expect(sort.isAvailable(differentSort)).toBeTruthy();
      expect(sort.state.availableSorts.length).toEqual(3);
    });

    it('has selectable facets', async () => {
      const facetGenerator = productListing.facetGenerator();
      const controllers = facetGenerator.facets;
      const facetController = controllers[0];

      await waitForNextStateChange(facetController, {
        action: () => {
          switch (facetController.type) {
            case 'numericalRange':
              facetController.toggleSelect(facetController.state.values[0]);
              break;
            case 'dateRange':
              facetController.toggleSelect(facetController.state.values[0]);
              break;
            case 'regular':
              facetController.toggleSelect(facetController.state.values[0]);
              break;
            case 'hierarchical':
              facetController.toggleSelect(facetController.state.values[0]);
              break;
            default:
              break;
          }
        },
        expectedSubscriberCalls: 2,
      });

      expect(facetController.state.values[0].state).toEqual('selected');
    });
  });

  it('searches', async () => {
    const searchBox = buildSearchBox(engine);
    searchBox.updateText('yellow');

    const search = buildSearch(engine);

    await waitForNextStateChange(search, {
      action: () => search.executeFirstSearch(),
      expectedSubscriberCalls: 2,
    });

    expect(search.state.products).not.toEqual([]);
  });

  it('provides suggestions', async () => {
    const box = buildSearchBox(engine);
    await search(box, 'l');

    expect(box.state.suggestions).not.toEqual([]);
  });

  it('provides recommendations', async () => {
    const recommendations = buildRecommendations(engine, {
      options: {
        slotId: 'abccdea4-7d8d-4d56-b593-20267083f88f',
      },
    });
    await waitForNextStateChange(recommendations, {
      action: () => recommendations.refresh(),
      expectedSubscriberCalls: 2,
    });

    expect(recommendations.state.products).not.toEqual([]);
  });

  it('provides field suggestions', async () => {
    const box = buildSearchBox(engine);
    const generator = buildFieldSuggestionsGenerator(engine);

    await search(box, 'can');

    expect(generator.fieldSuggestions).toHaveLength(3);

    for (const controller of generator.fieldSuggestions) {
      await waitForNextStateChange(controller, {
        action: () => controller.updateText('can'),
        expectedSubscriberCalls: 2,
      });
    }

    let controller = generator.fieldSuggestions.find(
      (controller) => controller.state.facetId === 'ec_category'
    )!;

    expect(controller.state.values).not.toEqual([]);

    await search(box, 'acc');

    for (const controller of generator.fieldSuggestions) {
      await waitForNextStateChange(controller, {
        action: () => controller.updateText('acc'),
        expectedSubscriberCalls: 3,
      });
    }

    controller = generator.fieldSuggestions.find(
      (controller) => controller.state.facetId === 'ec_category'
    )! as CategoryFieldSuggestions;

    expect(controller.state.values).not.toEqual([]);
    for (const value of controller.state.values) {
      expect(value.displayValue).toContain('Acc');
    }
  });

  async function search(box: SearchBox, query: string) {
    await waitForNextStateChange(box, {
      action: () => box.updateText(query),
      expectedSubscriberCalls: 3,
    });
  }
});
