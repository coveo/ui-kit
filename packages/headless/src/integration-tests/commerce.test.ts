import {getOrganizationEndpoints} from '../api/platform-client';
import {
  CommerceEngine,
  buildCommerceEngine,
} from '../app/commerce-engine/commerce-engine';
import {buildCart} from '../controllers/commerce/context/cart/headless-cart';
import {buildRelevanceSortCriterion} from '../controllers/commerce/core/sort/headless-core-commerce-sort';
import {buildProductListingFacetGenerator} from '../controllers/commerce/product-listing/facets/headless-product-listing-facet-generator';
import {ProductListing} from '../controllers/commerce/product-listing/headless-product-listing';
import {buildProductListing} from '../controllers/commerce/product-listing/headless-product-listing';
import {buildProductListingSort} from '../controllers/commerce/product-listing/sort/headless-product-listing-sort';
import {buildSearchBox} from '../controllers/commerce/search-box/headless-search-box';
import {buildSearch} from '../controllers/commerce/search/headless-search';
import {updateQuery} from '../features/commerce/query/query-actions';
import {waitForNextStateChange} from '../test/functional-test-utils';

const accessToken = 'no';

// eslint-disable-next-line @cspell/spellchecker
// TODO CAPI-149: Skipped since we do not currently have test fixtures for commerce
describe.skip('commerce', () => {
  let engine: CommerceEngine;

  beforeEach(() => {
    // eslint-disable-next-line @cspell/spellchecker
    const organizationId = 'barcasportsmcy01fvu';
    engine = buildCommerceEngine({
      configuration: {
        organizationId,
        accessToken,
        organizationEndpoints: {
          ...getOrganizationEndpoints(organizationId, 'dev'),
        },
        analytics: {
          trackingId: 'barca',
        },
        context: {
          language: 'en-gb',
          country: 'gb',
          currency: 'GBP',
          view: {
            url: 'https://sports-dev.barca.group/browse/promotions/surf-with-us-this-year',
          },
        },
      },
      loggerOptions: {level: 'silent'},
    });

    const cart = buildCart(engine);
    cart.updateItem({
      productId: 'p1',
      quantity: 2,
      price: 100,
      name: 'Nice Shoes',
    });
    cart.updateItem({
      productId: 'p2',
      quantity: 3,
      price: 200,
      name: 'Nicer Shoes',
    });
  });

  const fetchProductListing = async (): Promise<ProductListing> => {
    const productListing = buildProductListing(engine);
    await waitForNextStateChange(engine, {
      action: () => {
        productListing.refresh();
      },
      expectedSubscriberCalls: 2,
    });

    return productListing;
  };

  it('uses the context to fetch the product listing', async () => {
    const productListing = await fetchProductListing();

    expect(productListing.state.products).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ec_name: 'adidas_sale',
        }),
        expect.objectContaining({
          ec_name: 'nike_sale',
        }),
        expect.objectContaining({
          ec_name: 'puma_sale',
        }),
      ])
    );
  });

  it('applies sort to product listing', async () => {
    const sort = buildProductListingSort(engine);
    const relevance = buildRelevanceSortCriterion();
    sort.sortBy(relevance);

    await fetchProductListing();

    expect(sort.isSortedBy(relevance)).toBeTruthy();
    expect(sort.isAvailable(relevance)).toBeTruthy();
    expect(sort.state.availableSorts.length).toEqual(2);
  });

  it('has selectable facets', async () => {
    // Query the commerce api
    await fetchProductListing();

    // Generate the facets from the response
    const facetGenerator = buildProductListingFacetGenerator(engine);
    const controllers = facetGenerator.state.facets;
    const facetController = controllers[0];

    // Select a facet
    await waitForNextStateChange(engine, {
      action: () => {
        facetController.toggleSelect({
          ...facetController.state.values[0],
          state: 'selected',
        });
      },
      expectedSubscriberCalls: 8,
    });

    // Have it reflected on the local state
    expect(facetController.state.values[0].state).toEqual('selected');
  });

  it('searches', async () => {
    engine.dispatch(updateQuery({query: 'yellow'}));
    const search = buildSearch(engine);
    await waitForNextStateChange(engine, {
      action: () => {
        search.executeFirstSearch();
      },
      expectedSubscriberCalls: 4,
    });

    expect(search.state.products).not.toEqual([]);
  });

  it('provides suggestions', async () => {
    const box = buildSearchBox(engine);
    await waitForNextStateChange(engine, {
      action: () => {
        box.updateText('l');
      },
      expectedSubscriberCalls: 3,
    });

    expect(box.state.suggestions).not.toEqual([]);
  });
});
